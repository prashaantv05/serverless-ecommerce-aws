resource "aws_cognito_user_pool" "kart_pool" {
  name = "kart-user-pool"

  auto_verified_attributes = ["email"]

  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  password_policy {
    minimum_length = 8
  }
}

resource "aws_cognito_user_pool_client" "kart_client" {
  name         = "kart-client"
  user_pool_id = aws_cognito_user_pool.kart_pool.id

  generate_secret = false

  supported_identity_providers = ["COGNITO"]

  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code", "implicit"]
  allowed_oauth_scopes                 = ["email", "openid", "profile"]

  callback_urls = ["https://dx4o02gcthxe4.cloudfront.net", "https://dx4o02gcthxe4.cloudfront.net/"]
  logout_urls   = ["https://dx4o02gcthxe4.cloudfront.net", "https://dx4o02gcthxe4.cloudfront.net/"]
  default_redirect_uri = "https://dx4o02gcthxe4.cloudfront.net/"

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_PASSWORD_AUTH"
  ]
}

resource "aws_cognito_user_group" "admin" {
  name         = "Admin"
  user_pool_id = aws_cognito_user_pool.kart_pool.id
}

resource "aws_cognito_user_group" "customer" {
  name         = "Customer"
  user_pool_id = aws_cognito_user_pool.kart_pool.id
}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.kart_pool.id
}

output "cognito_client_id" {
  value = aws_cognito_user_pool_client.kart_client.id
}