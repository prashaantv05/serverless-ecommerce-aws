output "api_endpoint" {
  value = aws_apigatewayv2_api.api.api_endpoint
}

output "product_lambda" {
  value = aws_lambda_function.product.function_name
}

output "cart_lambda" {
  value = aws_lambda_function.cart.function_name
}

output "order_lambda" {
  value = aws_lambda_function.order.function_name
}