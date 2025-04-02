variable "service_name" {
  description = "Name of the service (used in resources naming)"
  type        = string
}

variable "cluster_id" {
  description = "ARN of the ECS cluster"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID where resources will be deployed"
  type        = string
}

variable "private_subnets" {
  description = "List of private subnet IDs"
  type        = list(string)
}

variable "port" {
  description = "gRPC service port"
  type        = number
  default     = 50051
}

variable "allowed_cidr_blocks" {
  description = "CIDR blocks allowed to access gRPC port"
  type        = list(string)
  default     = ["10.0.0.0/16"]  # Разрешить весь VPC
}

variable "task_cpu" {
  description = "CPU units for the task"
  type        = number
  default     = 256  # 0.25 vCPU
}

variable "task_memory" {
  description = "Memory for the task (MB)"
  type        = number
  default     = 512   # 0.5 GB
}

variable "desired_count" {
  description = "Number of tasks to run"
  type        = number
  default     = 2  # Для отказоустойчивости
}

variable "environment_variables" {
  description = "Environment variables for the container"
  type        = map(string)
  default     = {}
}

variable "log_retention_days" {
  description = "CloudWatch log retention period"
  type        = number
  default     = 7
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}