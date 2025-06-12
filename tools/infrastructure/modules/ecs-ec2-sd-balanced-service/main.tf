#ecs-ec2-sd-balanced-service
# 1. ECR repository
resource "aws_ecr_repository" "service" {
  name                 = var.service_name
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

# 2. IAM roles and policies
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



# 9. Task Definition for gRPC service
resource "aws_ecs_task_definition" "service" {
  family                   = var.service_name
  network_mode             = "awsvpc" # Use awsvpc network mode for better network performance
  requires_compatibilities = ["EC2"]
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
      hostPort      = var.port,
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

# 10. CloudWatch Log Group
resource "aws_cloudwatch_log_group" "ecs_logs" {
  name              = "/ecs/${var.service_name}"
  retention_in_days = var.log_retention_days
}

# 11. ECS Service without Load Balancer
resource "aws_ecs_service" "service" {
  name            = "${var.service_name}-service"
  cluster         = var.cluster_id
  task_definition = aws_ecs_task_definition.service.arn
  desired_count   = var.desired_count

  # Network configuration for awsvpc mode
  network_configuration {
    subnets          = var.private_subnets
    security_groups  = [var.sg_id]
    assign_public_ip = false
  }

  capacity_provider_strategy {
    capacity_provider = var.ecs_cp_name
    weight            = 100
  }

  # Enable Service Discovery for gRPC
  service_registries {
    registry_arn = aws_service_discovery_service.grpc_service.arn
  }

  depends_on = [
    aws_service_discovery_service.grpc_service
  ]
}


resource "aws_service_discovery_service" "grpc_service" {
  name = var.service_name


  dns_config {
    namespace_id = var.dns_namspace_id
    dns_records {
      ttl  = 10
      type = "A"
    }

    routing_policy = "MULTIVALUE"
  }

  health_check_custom_config {
    failure_threshold = 1
  }
}

