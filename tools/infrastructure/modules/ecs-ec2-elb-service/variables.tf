variable "cluster_name" {
  type = string
}
variable "cluster_id" {
  type = string
}
variable "postgres_ip" {
  type = string
}
variable "service_name" {
  type    = string
  default = "unnamed-service"
}
variable "vpc_id" {
  description = "VPC ID where resources will be deployed"
  type        = string
}
variable "sg_id" {
  description = "VPC ID where resources will be deployed"
  type        = string
}
variable "ecs_cp_name" {
  description = "Name of the ECS Capacity Provider"
  type        = string
}
variable "private_subnets" {
  description = "List of private subnet IDs"
  type        = list(string)
}
variable "public_subnets" {
  description = "List of private subnet IDs"
  type        = list(string)
}
variable "allowed_cidr_blocks" {
  description = "CIDR blocks allowed to access gRPC port"
  type        = list(string)
  default     = ["0.0.0.0/0"] # Разрешить весь VPC
}
variable "min_size" {
  description = "Minimum number of instances in ASG"
  type        = number
  default     = 1
}

variable "max_size" {
  description = "Maximum number of instances in ASG"
  type        = number
  default     = 3
}

variable "task_cpu" {
  description = "CPU units for the task"
  type        = number
  default     = 256 # 0.25 vCPU
}

variable "task_memory" {
  description = "Memory for the task (MB)"
  type        = number
  default     = 256 # 0.5 GB
}
variable "desired_count" {
  description = "Number of tasks to run"
  type        = number
  default     = 2 # Для отказоустойчивости
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
