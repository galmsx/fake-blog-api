resource "aws_security_group" "postgres_sg" {
  name        = "postgres-security-group"
  description = "Allow PostgreSQL and SSH access"
  vpc_id      = aws_vpc.main.id

  # SSH (for access and configuration)
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Better to restrict to your IP!
  }

  # PostgreSQL
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Open for testing, restrict in production!
  }

  # Outbound traffic
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

# EC2 instance (using the cheapest - t4g.nano)
resource "aws_instance" "postgres_instance" {
  ami           = data.aws_ami.amazon_linux_2023_arm.id
  instance_type = "t4g.nano" # 0.5 GB RAM, 2 vCPU (~$3-5/month)
  # key_name      = "your-key-pair"           # Specify your SSH key
  subnet_id              = aws_subnet.public_az1.id
  # subnet_id              = aws_subnet.private_az1.id
  vpc_security_group_ids = [aws_security_group.postgres_sg.id]

  user_data = <<-EOF
              #!/bin/bash
              # Installing Docker
              sudo yum update -y
              sudo yum install -y docker
              sudo systemctl start docker
              sudo systemctl enable docker
              sudo usermod -aG docker ec2-user

              # Running PostgreSQL in Docker
              docker run -d \
                --name postgres-test \
                -e POSTGRES_USER=${var.db_username} \
                -e POSTGRES_PASSWORD=${var.db_password} \
                -e POSTGRES_DB=${var.db_name} \
                -p ${var.db_port}:5432 \
                postgres:15-alpine

              # Waiting for PostgreSQL to start
              sleep 10

              # Creating schema in the database
              docker exec postgres-test psql -U admin -d testdb -c "CREATE SCHEMA IF NOT EXISTS test_schema;"
              EOF

  tags = {
    Name = "postgres-test-instance"
  }
}
