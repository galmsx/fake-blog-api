variable "projects" {
  type = map(any)

  default = {
    gateway = {
      name         = "gateway",
      instanceType = "t2.micro",
      port         = 80,
      type         = "EC2_ELB"
    }
    auth = {
      name         = "auth"
      instanceType = "t2.micro"
      port         = 50051
      type         = "EC2_SD"
    }
    user = {
      name         = "user"
      instanceType = "t2.micro"
      port         = 50051
      type         = "FARGATE_SD"
    }
  }

  validation {
    condition = alltrue([
      for k, v in var.projects : contains(["EC2_ELB", "EC2_SD", "FARGATE_SD"], v.type)
    ])
    error_message = "Invalid 'type' in projects. Allowed values: EC2_ELB, EC2_SD, FARGATE_SD."
  }
}
variable "aws_region" {
  type    = string
  default = "us-east-1"
}
