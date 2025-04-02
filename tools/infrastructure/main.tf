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
  vpc_id = aws_vpc.main.id
}

# module "ecs-service-ec2-sd" {
#   for_each = { for k, v in var.projects : k => v if v.type == "EC2_SD" }
#   source   = "./modules/ecs-ec2-sd-balanced-service"
#   # остальные параметры
#   cluster_name = aws_ecs_cluster.cluster.name
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
