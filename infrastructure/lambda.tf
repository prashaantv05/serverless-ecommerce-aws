resource "aws_lambda_function" "product" {
  function_name    = "product-service-terraform"
  handler          = "index.handler"
  runtime          = "nodejs18.x"
  role             = aws_iam_role.lambda_role.arn
  filename         = "${path.module}/../services/product/product.zip"
  source_code_hash = filebase64sha256("${path.module}/../services/product/product.zip")

  tracing_config {
    mode = "Active"
  }
}

resource "aws_lambda_function" "cart" {
  function_name    = "cart-service-terraform"
  handler          = "index.handler"
  runtime          = "nodejs18.x"
  role             = aws_iam_role.lambda_role.arn
  filename         = "${path.module}/../services/cart/cart.zip"
  source_code_hash = filebase64sha256("${path.module}/../services/cart/cart.zip")
  environment {
    variables = {
      PRODUCT_API = "https://n8jfqgmey7.execute-api.ap-southeast-1.amazonaws.com/products"
    }
  }

  tracing_config {
    mode = "Active"
  }
}

resource "aws_lambda_function" "order" {
  function_name    = "order-service-terraform"
  handler          = "index.handler"
  runtime          = "nodejs18.x"
  role             = aws_iam_role.lambda_role.arn
  filename         = "${path.module}/../services/order/order.zip"
  source_code_hash = filebase64sha256("${path.module}/../services/order/order.zip")

  tracing_config {
    mode = "Active"
  }
}
