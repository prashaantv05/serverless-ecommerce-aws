########################################
# S3 BUCKET (PRIVATE FRONTEND)
########################################

resource "aws_s3_bucket" "frontend" {
  bucket = "prash-frontend-terraform-123"
}

########################################
# BLOCK ALL PUBLIC ACCESS
########################################

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

########################################
# ORIGIN ACCESS CONTROL
########################################

resource "aws_cloudfront_origin_access_control" "oac" {
  name                              = "frontend-oac-v2"
  description                       = "CloudFront access to S3"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

########################################
# FRONTEND FILES
########################################

resource "aws_s3_object" "index" {
  bucket       = aws_s3_bucket.frontend.id
  key          = "index.html"
  source       = "${path.module}/../frontend/index.html"
  content_type = "text/html"

  etag = filemd5("${path.module}/../frontend/index.html")
}

resource "aws_s3_object" "frontend_assets" {

  for_each = fileset("${path.module}/../frontend", "**/*")

  bucket = aws_s3_bucket.frontend.id

  key    = each.value
  source = "${path.module}/../frontend/${each.value}"

  etag = filemd5("${path.module}/../frontend/${each.value}")

  content_type = (
    endswith(each.value, ".html") ? "text/html" :
    endswith(each.value, ".css") ? "text/css" :
    endswith(each.value, ".js") ? "application/javascript" :
    "binary/octet-stream"
  )
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

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  depends_on = [
    aws_s3_object.index,
    aws_s3_object.frontend_assets
  ]
}

########################################
# S3 POLICY FOR CLOUDFRONT
########################################

resource "aws_s3_bucket_policy" "frontend_policy" {

  bucket = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Principal = {
          Service = "cloudfront.amazonaws.com"
        }

        Action = [
          "s3:GetObject"
        ]

        Resource = [
          "${aws_s3_bucket.frontend.arn}/*"
        ]

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
# OUTPUTS
########################################

output "frontend_url" {
  value = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}