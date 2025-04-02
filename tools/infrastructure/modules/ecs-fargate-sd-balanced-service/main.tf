# 1. ECR репозиторий
resource "aws_ecr_repository" "service" {
  name                 = var.service_name
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
}

# 2. IAM роли (только execution role для Fargate)
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "${var.service_name}-ecs-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action = "sts:AssumeRole",
      Effect = "Allow",
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# 3. Security Group для gRPC
resource "aws_security_group" "grpc_sg" {
  name        = "${var.service_name}-grpc-sg"
  description = "Security group for gRPC communication"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = var.port
    to_port     = var.port
    protocol    = "tcp"
    cidr_blocks = var.allowed_cidr_blocks
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 4. Task Definition для Fargate
resource "aws_ecs_task_definition" "service" {
  family                   = var.service_name
  network_mode             = "awsvpc"  # Обязательно для Fargate
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  cpu                      = var.task_cpu
  memory                   = var.task_memory

  container_definitions = jsonencode([{
    name      = "${var.service_name}-container",
    image     = "${aws_ecr_repository.service.repository_url}:latest",
    cpu       = var.task_cpu,
    memory    = var.task_memory,
    essential = true,
    portMappings = [{
      containerPort = var.port,
      protocol      = "tcp"
    }],
    environment = [
      for k, v in var.environment_variables : {
        name  = k,
        value = v
      }
    ],
    logConfiguration = {
      logDriver = "awslogs",
      options = {
        "awslogs-group"         = "/ecs/${var.service_name}",
        "awslogs-region"        = var.aws_region,
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
}

# 5. CloudWatch Log Group
resource "aws_cloudwatch_log_group" "ecs_logs" {
  name              = "/ecs/${var.service_name}"
  retention_in_days = var.log_retention_days
}

# 6. Service Discovery
resource "aws_service_discovery_private_dns_namespace" "grpc" {
  name        = "${var.service_name}.local"
  description = "Private DNS namespace for gRPC services"
  vpc         = var.vpc_id
}

resource "aws_service_discovery_service" "grpc" {
  name = var.service_name

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.grpc.id
    
    dns_records {
      ttl  = 10  # Короткий TTL для быстрого обновления DNS
      type = "A"
    }
    
    routing_policy = "MULTIVALUE"  # Возвращает все доступные IP
  }

  health_check_custom_config {
    failure_threshold = 2  # После 2 неудачных проверок исключается из DNS
  }
}

# 7. ECS Service на Fargate
resource "aws_ecs_service" "service" {
  name            = "${var.service_name}-service"
  cluster         = var.cluster_id
  task_definition = aws_ecs_task_definition.service.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnets  # Должны быть минимум в 2 AZ
    security_groups  = [aws_security_group.grpc_sg.id]
    assign_public_ip = false  # Используем private subnets
  }

  service_registries {
    registry_arn = aws_service_discovery_service.grpc.arn
  }

  # Отключаем дефолтное развертывание через ALB
  deployment_controller {
    type = "ECS"
  }
}