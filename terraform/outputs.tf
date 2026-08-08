output "alb_dns_name" {
  description = "The DNS name of the Application Load Balancer"
  value       = aws_lb.backend_alb.dns_name
}

output "s3_website_url" {
  description = "The URL of the static website hosted on S3"
  value       = aws_s3_bucket_website_configuration.frontend_bucket_website.website_endpoint
}

output "s3_bucket_name" {
  description = "The name of the S3 bucket"
  value       = aws_s3_bucket.frontend_bucket.bucket
}

output "cloudfront_url" {
  description = "The HTTPS URL of the CloudFront distribution"
  value       = "https://${aws_cloudfront_distribution.frontend_cdn.domain_name}"
}
