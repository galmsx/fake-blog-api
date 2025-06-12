terraform {
  backend "s3" {
    bucket       = "galmsx-tfstate-test"
    key          = "state"
    region       = "us-east-1"
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

resource "aws_iam_role" "ecs_instance_role" {
  name = "my-ecs-instance-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action = "sts:AssumeRole",
      Effect = "Allow",
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_instance_role_policy" {
  role       = aws_iam_role.ecs_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_iam_instance_profile" "ecs_instance_profile" {
  name = "my-ecs-instance-profile"
  role = aws_iam_role.ecs_instance_role.name
}

# 3. Create security group for ECS EC2 instances
resource "aws_security_group" "ecs_sg" {
  name        = "my-ecs-instance-sg"
  description = "Security group for ECS EC2 instances"
  vpc_id      = aws_vpc.main.id
  ingress {
    from_port = 80
    to_port   = 50051
    protocol  = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

data "aws_ami" "ecs_optimized" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-ecs-hvm-*-x86_64-ebs"]
  }
}

resource "aws_launch_template" "ecs_launch_template" {
  name_prefix   = "ecs-cluster-launch-template-"
  image_id      = data.aws_ami.ecs_optimized.id
  instance_type = var.ec2_instance_type

  iam_instance_profile {
    name = aws_iam_instance_profile.ecs_instance_profile.name
  }

  network_interfaces {
    security_groups = [aws_security_group.ecs_sg.id]
  }

  user_data = base64encode(<<-EOF
              #!/bin/bash
              echo ECS_CLUSTER=${aws_ecs_cluster.cluster.name} >> /etc/ecs/ecs.config
              EOF
  )

  lifecycle {
    create_before_destroy = true
  }
}

# 4. Create Auto Scaling Group for ECS cluster
resource "aws_autoscaling_group" "ecs_cluster_asg" {
  name                = "my-ecs-cluster-asg"
  vpc_zone_identifier = [aws_subnet.private_az1.id, aws_subnet.private_az2.id]
  min_size            = 1
  max_size            = 5
  desired_capacity    = 2

  launch_template {
    id      = aws_launch_template.ecs_launch_template.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "ECS Instance - Shared Cluster"
    propagate_at_launch = true
  }

  tag {
    key                 = "AmazonECSManaged"
    value               = ""
    propagate_at_launch = true
  }
}

# 5. Create Capacity Provider
resource "aws_ecs_capacity_provider" "ecs_cp" {
  name = "my-ecs-cluster-cp"

  auto_scaling_group_provider {
    auto_scaling_group_arn = aws_autoscaling_group.ecs_cluster_asg.arn

    managed_scaling {
      maximum_scaling_step_size = 2
      minimum_scaling_step_size = 1
      status                    = "ENABLED"
      target_capacity           = 90
    }
  }
}

resource "aws_ecs_cluster_capacity_providers" "cluster_cps" {
  cluster_name       = aws_ecs_cluster.cluster.name
  capacity_providers = [aws_ecs_capacity_provider.ecs_cp.name]

  default_capacity_provider_strategy {
    base              = 1
    weight            = 100
    capacity_provider = aws_ecs_capacity_provider.ecs_cp.name
  }
}

module "ecs-service-ec2-elb" {
  for_each = { for k, v in var.projects : k => v if v.type == "EC2_ELB" }
  source   = "./modules/ecs-ec2-elb-service"
  # Other parameters
  cluster_name = aws_ecs_cluster.cluster.name
  cluster_id   = aws_ecs_cluster.cluster.id
  service_name = each.value.name
  aws_region   = var.aws_region
  sg_id        = aws_security_group.ecs_sg.id
  ecs_cp_name  = aws_ecs_capacity_provider.ecs_cp.name
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
    JWT_SECRET  = var.jwt_secret
    JWT_REFRESH = var.jwt_refresh
    NODE_ENV    = var.node_env
  }
  depends_on = [aws_ecs_cluster_capacity_providers.cluster_cps, aws_instance.postgres_instance]
}

module "ecs-service-ec2-sd" {
  for_each = { for k, v in var.projects : k => v if v.type == "EC2_SD" }
  source   = "./modules/ecs-ec2-sd-balanced-service"
  # Other parameters
  cluster_name = aws_ecs_cluster.cluster.name
  cluster_id   = aws_ecs_cluster.cluster.id
  service_name = each.value.name
  aws_region   = var.aws_region
  sg_id        = aws_security_group.ecs_sg.id
  ecs_cp_name  = aws_ecs_capacity_provider.ecs_cp.name
  private_subnets = [
    aws_subnet.private_az1.id,
    aws_subnet.private_az2.id
  ]
  vpc_id      = aws_vpc.main.id
  dns_namspace_id = aws_service_discovery_private_dns_namespace.local_namespace.id
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
  depends_on = [aws_ecs_cluster_capacity_providers.cluster_cps, aws_instance.postgres_instance]
}

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

