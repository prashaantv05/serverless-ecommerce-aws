resource "aws_apigatewayv2_api" "api" {
  name          = "ecommerce-api-terraform"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["*"]
    allow_headers = ["*"]
    max_age       = 300
  }
}

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


resource "aws_apigatewayv2_route" "product" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "ANY /products/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.product.id}"
}

resource "aws_apigatewayv2_route" "product_base" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "ANY /products"
  target    = "integrations/${aws_apigatewayv2_integration.product.id}"
}

resource "aws_apigatewayv2_route" "cart" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "ANY /cart/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.cart.id}"
}

resource "aws_apigatewayv2_route" "cart_base" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "ANY /cart"
  target    = "integrations/${aws_apigatewayv2_integration.cart.id}"
}

resource "aws_apigatewayv2_route" "order" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "ANY /orders/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.order.id}"
}

resource "aws_apigatewayv2_route" "order_base" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "ANY /orders"
  target    = "integrations/${aws_apigatewayv2_integration.order.id}"
}

resource "aws_cloudwatch_log_group" "apigw_logs" {
  name              = "/aws/apigateway/prashaant-apigw-logs"
  retention_in_days = 14
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.apigw_logs.arn
    format = jsonencode({
      requestId               = "$context.requestId"
      sourceIp                = "$context.identity.sourceIp"
      requestTime             = "$context.requestTime"
      protocol                = "$context.protocol"
      httpMethod              = "$context.httpMethod"
      resourcePath            = "$context.resourcePath"
      routeKey                = "$context.routeKey"
      status                  = "$context.status"
      responseLength          = "$context.responseLength"
      integrationErrorMessage = "$context.integrationErrorMessage"
      integrationLatency      = "$context.integrationLatency"
    })
  }
}
