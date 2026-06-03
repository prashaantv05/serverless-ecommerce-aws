resource "aws_cognito_managed_login_branding" "branding" {
  user_pool_id = aws_cognito_user_pool.kart_pool.id
  client_id    = aws_cognito_user_pool_client.kart_client.id
  use_cognito_provided_values = true
}
