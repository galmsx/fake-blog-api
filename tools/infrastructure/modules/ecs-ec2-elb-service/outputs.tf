output "pub_ip" {
  value = aws_lb.ecs_alb.dns_name
}
output "repository_url" {
  value = aws_ecr_repository.service.repository_url
}