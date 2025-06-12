#ecs-ec2-elb-service
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

# 8. Load Balancer resources
resource "aws_lb" "ecs_alb" {
  name               = "${var.service_name}-ecs-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.sg_id]
  subnets            = var.public_subnets

  enable_deletion_protection = false
}

resource "aws_lb_target_group" "ecs_tg" {
  name        = "${var.service_name}-ecs-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "instance"

  health_check {
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 3
    path                = "/api/health-check"
    interval            = 120
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.ecs_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.ecs_tg.arn
  }
}

# 9. Task Definition
resource "aws_ecs_task_definition" "service" {
  family                   = var.service_name
  network_mode             = "bridge"
  requires_compatibilities = ["EC2"]
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  cpu                      = var.task_cpu
  memory                   = var.task_memory

  container_definitions = jsonencode([{
    name      = "${var.service_name}-service-container",
    image     = "${aws_ecr_repository.service.repository_url}:latest",
    cpu       = var.task_cpu
    memory    = var.task_memory
    essential = true,
    portMappings = [{
      containerPort = 80,
      hostPort      = 80,
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
        "awslogs-region"        = "us-east-1",
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

# 11. ECS Service
resource "aws_ecs_service" "service" {
  name            = "${var.service_name}-service"
  cluster         = var.cluster_id
  task_definition = aws_ecs_task_definition.service.arn
  desired_count   = var.desired_count

  load_balancer {
    target_group_arn = aws_lb_target_group.ecs_tg.arn
    container_name   = "${var.service_name}-service-container"
    container_port   = 80
  }

  capacity_provider_strategy {
    capacity_provider = var.ecs_cp_name
    weight            = 100
  }

  depends_on = [
    aws_lb_listener.http,
  ]
}

