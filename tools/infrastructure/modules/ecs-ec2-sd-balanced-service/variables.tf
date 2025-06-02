variable "service_name" {
  description = "Name of the service"
  type        = string
}

variable "cluster_name" {
  description = "Name of the ECS cluster"
  type        = string
}

variable "cluster_id" {
  description = "ID of the ECS cluster"
  type        = string
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
variable "postgres_ip" {
  type = string
}

variable "private_subnets" {
  description = "List of private subnet IDs"
  type        = list(string)
}

variable "port" {
  description = "Port for gRPC communication"
  type        = number
  default     = 80
}

variable "allowed_cidr_blocks" {
  description = "CIDR blocks allowed to access gRPC service"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "instance_type" {
  description = "EC2 instance type for ECS cluster"
  type        = string
  default     = "t2.micro"
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

variable "desired_count" {
  description = "Desired number of tasks for ECS service"
  type        = number
  default     = 1
}

variable "task_cpu" {
  description = "CPU units for ECS task"
  type        = number
  default     = 256
}

variable "task_memory" {
  description = "Memory for ECS task (MB)"
  type        = number
  default     = 512
}

variable "environment_variables" {
  description = "Environment variables for the container"
  type        = map(string)
  default     = {}
}

variable "log_retention_days" {
  description = "Number of days to retain logs in CloudWatch"
  type        = number
  default     = 7
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "dns_namspace_id" {
  type = string
}
