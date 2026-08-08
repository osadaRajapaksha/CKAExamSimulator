variable "aws_region" {
  description = "The AWS region to deploy to"
  default     = "us-east-2"
}

variable "instance_type" {
  description = "EC2 instance type (t3.small or t3.medium recommended for K8s)"
  default     = "t3.large"
}
