output "pub_ip" {
  value = aws_lb.ecs_alb.dns_name
}