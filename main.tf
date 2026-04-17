# ================= PROVIDER =================
provider "aws" {
  region  = var.region
  profile = var.profile
}

# ================= DYNAMODB =================
resource "aws_dynamodb_table" "products" {
  name         = "Prash_Products-Terraform"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }
}

resource "aws_dynamodb_table" "cart" {
  name         = "Prash_Cart-Terraform"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"
  range_key    = "productId"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "productId"
    type = "S"
  }
}

resource "aws_dynamodb_table" "orders" {
  name         = "Prash_Orders-Terraform"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "orderId"

  attribute {
    name = "orderId"
    type = "S"
  }
}

# ================= IAM ROLE =================
resource "aws_iam_role" "lambda_role" {
  name = "lambda_exec_role_terraform"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action = "sts:AssumeRole",
      Effect = "Allow",
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}

# ================= LAMBDA =================
resource "aws_lambda_function" "product" {
  function_name = "product-service-terraform"
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  role          = aws_iam_role.lambda_role.arn
  filename      = var.product_zip

  lifecycle {
    ignore_changes = [source_code_hash]
  }
}

resource "aws_lambda_function" "cart" {
  function_name = "cart-service-terraform"
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  role          = aws_iam_role.lambda_role.arn
  filename      = var.cart_zip

  lifecycle {
    ignore_changes = [source_code_hash]
  }
}

resource "aws_lambda_function" "order" {
  function_name = "order-service-terraform"
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  role          = aws_iam_role.lambda_role.arn
  filename      = var.order_zip

  lifecycle {
    ignore_changes = [source_code_hash]
  }
}

# ================= API GATEWAY =================
resource "aws_apigatewayv2_api" "api" {
  name          = "ecommerce-api-terraform"
  protocol_type = "HTTP"
}

# ================= INTEGRATIONS =================
resource "aws_apigatewayv2_integration" "product" {
  api_id                 = aws_apigatewayv2_api.api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.product.invoke_arn
  payload_format_version = "1.0"
}

resource "aws_apigatewayv2_integration" "cart" {
  api_id                 = aws_apigatewayv2_api.api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.cart.invoke_arn
  payload_format_version = "1.0"
}

resource "aws_apigatewayv2_integration" "order" {
  api_id                 = aws_apigatewayv2_api.api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.order.invoke_arn
  payload_format_version = "1.0"
}

# ================= ROUTES =================
resource "aws_apigatewayv2_route" "product" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "ANY /products/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.product.id}"
}

resource "aws_apigatewayv2_route" "cart" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "ANY /cart/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.cart.id}"
}

resource "aws_apigatewayv2_route" "order" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "ANY /orders/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.order.id}"
}

# ================= STAGE (VERY IMPORTANT) =================
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true
}

# ================= LAMBDA PERMISSIONS =================
resource "aws_lambda_permission" "apigw_product" {
  statement_id  = "AllowAPIGatewayInvokeProduct"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.product.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "apigw_cart" {
  statement_id  = "AllowAPIGatewayInvokeCart"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cart.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "apigw_order" {
  statement_id  = "AllowAPIGatewayInvokeOrder"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.order.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}