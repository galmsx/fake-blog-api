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
    comment = {
      name         = "comment"
      instanceType = "t2.micro"
      port         = 50051
      type         = "EC2_SD"
    }
    post = {
      name         = "post"
      instanceType = "t2.micro"
      port         = 50051
      type         = "EC2_SD"
    }
    user = {
      name         = "user"
      instanceType = "t2.micro"
      port         = 50051
      type         = "EC2_SD"
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
variable "db_username" {
  type = string
  default = "admin"
}
variable "db_password" {
  type = string
  default = "password"
}
variable "db_name" {
  type = string 
  default = "testdb"
}
variable "db_port" {
  type = string
  default = "5432"
}
variable "jwt_secret" {
  type = string
  default = "secret"
}
variable "jwt_refresh" {
  type = string
  default = "secret"
}
variable "node_env" {
  type = string
  default = "development"
}
