output "instance_public_ip" {
  description = "The public IP address of the K3s server"
  value       = aws_instance.k3s_server.public_ip
}

output "s3_website_url" {
  description = "The URL of the static website hosted on S3"
  value       = aws_s3_bucket_website_configuration.frontend_bucket_website.website_endpoint
}

output "s3_bucket_name" {
  description = "The name of the S3 bucket"
  value       = aws_s3_bucket.frontend_bucket.bucket
}
