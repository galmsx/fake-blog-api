terraform {
  backend "s3" {
    bucket = "galmsx-tfstate-test"
    key    = "state"
    region = "us-east-1"
    use_lockfile = true
  }
}

provider "aws" {
  region = var.aws_region
}

resource "aws_ecs_cluster" "cluster" {
  name = "my-ecs-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
}

# 2. Internet Gateway (для публичного ALB)
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
}

# 3. Публичные подсети (для ALB)
resource "aws_subnet" "public_az1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true # Для ALB
}

resource "aws_subnet" "public_az2" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "us-east-1b"
  map_public_ip_on_launch = true
}

# 4. Приватные подсети (для ECS-сервисов)
resource "aws_subnet" "private_az1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.101.0/24"
  availability_zone = "us-east-1a"
}

resource "aws_subnet" "private_az2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.102.0/24"
  availability_zone = "us-east-1b"
}
# 5. NAT Gateway (для выхода в интернет из приватных подсетей)
resource "aws_eip" "nat" {
  domain = "vpc"
}

resource "aws_nat_gateway" "nat" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public_az1.id # NAT должен быть в публичной подсети!
}
# 6. Таблицы маршрутов
## Публичная таблица (для ALB)
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
}

## Приватная таблица (для ECS-сервисов)
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat.id # Выход в интернет через NAT
  }
}
# 7. Привязка подсетей к таблицам маршрутов
resource "aws_route_table_association" "public_az1" {
  subnet_id      = aws_subnet.public_az1.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_az2" {
  subnet_id      = aws_subnet.public_az2.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private_az1" {
  subnet_id      = aws_subnet.private_az1.id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private_az2" {
  subnet_id      = aws_subnet.private_az2.id
  route_table_id = aws_route_table.private.id
}

resource "aws_security_group" "postgres_sg" {
  name        = "postgres-security-group"
  description = "Allow PostgreSQL and SSH access"
  vpc_id      = aws_vpc.main.id

  # SSH (для доступа и настройки)
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Лучше ограничить свой IP!
  }

  # PostgreSQL
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Для тестов можно открыть, в продакшене ограничьте!
  }

  # Исходящий трафик
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "postgres-sg"
  }
}
data "aws_ami" "amazon_linux_2023_arm" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-arm64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# EC2 инстанс (используем самый дешевый - t4g.nano)
resource "aws_instance" "postgres_instance" {
  ami           = data.aws_ami.amazon_linux_2023_arm.id
  instance_type = "t4g.nano" # 0.5 ГБ RAM, 2 vCPU (~$3-5/мес)
  # key_name      = "your-key-pair"           # Укажите свой ключ SSH
  subnet_id              = aws_subnet.private_az1.id
  vpc_security_group_ids = [aws_security_group.postgres_sg.id]

  user_data = <<-EOF
              #!/bin/bash
              # Устанавливаем Docker
              sudo yum update -y
              sudo yum install -y docker
              sudo systemctl start docker
              sudo systemctl enable docker
              sudo usermod -aG docker ec2-user

              # Запускаем PostgreSQL в Docker
              docker run -d \
                --name postgres-test \
                -e POSTGRES_USER=${var.db_username} \
                -e POSTGRES_PASSWORD=${var.db_password} \
                -e POSTGRES_DB=${var.db_name} \
                -p ${var.db_port}:5432 \
                postgres:15-alpine

              # Ждем запуска PostgreSQL
              sleep 10

              # Создаем схему (schema) в БД
              docker exec postgres-test psql -U admin -d testdb -c "CREATE SCHEMA IF NOT EXISTS test_schema;"
              EOF

  tags = {
    Name = "postgres-test-instance"
  }
}


module "ecs-service-ec2-elb" {
  for_each = { for k, v in var.projects : k => v if v.type == "EC2_ELB" }
  source   = "./modules/ecs-ec2-elb-service"
  # остальные параметры
  cluster_name = aws_ecs_cluster.cluster.name
  cluster_id   = aws_ecs_cluster.cluster.id
  service_name = each.value.name
  port         = each.value.port
  aws_region   = var.aws_region
  private_subnets = [
    aws_subnet.private_az1.id,
    aws_subnet.private_az2.id
  ]
  public_subnets = [
    aws_subnet.public_az1.id,
    aws_subnet.public_az2.id
  ]
  vpc_id      = aws_vpc.main.id
  postgres_ip = aws_instance.postgres_instance.private_ip
  environment_variables = {
    DB_HOST     = aws_instance.postgres_instance.private_ip,
    DB_USERNAME = var.db_username,
    DB_PASSWORD = var.db_password,
    DB_DATABASE = var.db_name,
    DB_PORT     = var.db_port
    NODE_ENV    = var.node_env
  }
}

module "ecs-service-ec2-sd" {
  for_each = { for k, v in var.projects : k => v if v.type == "EC2_SD" }
  source   = "./modules/ecs-ec2-sd-balanced-service"
  # остальные параметры
  cluster_name = aws_ecs_cluster.cluster.name
  cluster_id   = aws_ecs_cluster.cluster.id
  service_name = each.value.name
  port         = each.value.port
  aws_region   = var.aws_region
  private_subnets = [
    aws_subnet.private_az1.id,
    aws_subnet.private_az2.id
  ]
  vpc_id      = aws_vpc.main.id
  postgres_ip = aws_instance.postgres_instance.private_ip
  environment_variables = {
    DB_HOST     = aws_instance.postgres_instance.private_ip,
    DB_USERNAME = var.db_username,
    DB_PASSWORD = var.db_password,
    DB_DATABASE = var.db_name,
    DB_PORT     = var.db_port
    JWT_SECRET  = var.jwt_secret
    JWT_REFRESH = var.jwt_refresh
    NODE_ENV    = var.node_env
  }
}

# module "ecs-service-fargate" {
#   for_each = { for k, v in var.projects : k => v if v.type != "EC2_ELB" && v.type != "EC2_SD" }
#   source   = "./modules/ecs-fargate-sd-balanced-service"
#   # остальные параметры
#   cluster_id   = aws_ecs_cluster.cluster.id
#   service_name = each.value.name
#   port         = each.value.port
#   aws_region   = var.aws_region
#   private_subnets = [
#     aws_subnet.private_az1.id,
#     aws_subnet.private_az2.id
#   ]
#   vpc_id = aws_vpc.main.id
# }

output "lb_dns" {
  value = { for name, service in module.ecs-service-ec2-elb : name => service.pub_ip }
}

output "service_repository_urls" {
  value = merge(
    { for name, service in module.ecs-service-ec2-elb : name => service.repository_url },
    { for name, service in module.ecs-service-ec2-sd : name => service.repository_url }
  )
  description = "Map of service names to their ECR repository URLs"
}
