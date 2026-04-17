########################################
# S3 BUCKET (PRIVATE FRONTEND)
########################################
resource "aws_s3_bucket" "frontend" {
  bucket = "prash-frontend-terraform-123"
}

########################################
# BLOCK ALL PUBLIC ACCESS (IMPORTANT)
########################################
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

########################################
# ORIGIN ACCESS CONTROL (FIXED NAME 🔥)
########################################
resource "aws_cloudfront_origin_access_control" "oac" {
  name                              = "frontend-oac-v2"   # ✅ changed name
  description                       = "CloudFront access to S3"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

########################################
# CLOUDFRONT DISTRIBUTION
########################################
resource "aws_cloudfront_distribution" "frontend" {

  enabled             = true
  default_root_object = "index.html"

  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "s3-frontend"

    origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
  }

  default_cache_behavior {
    target_origin_id       = "s3-frontend"
    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  depends_on = [
    aws_s3_bucket.frontend
  ]
}

########################################
# S3 BUCKET POLICY (ALLOW CLOUDFRONT)
########################################
resource "aws_s3_bucket_policy" "frontend_policy" {
  bucket = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          Service = "cloudfront.amazonaws.com"
        },
        Action   = "s3:GetObject",
        Resource = "${aws_s3_bucket.frontend.arn}/*",
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.frontend.arn
          }
        }
      }
    ]
  })
}

########################################
# OUTPUT CLOUD FRONT URL
########################################
output "frontend_url" {
  value = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}