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
  subnet_id              = aws_subnet.public_az1.id
  # subnet_id              = aws_subnet.private_az1.id
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