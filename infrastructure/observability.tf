resource "aws_sns_topic" "alerts" {
  name = "prashaant-alerts-topic"
}

resource "aws_cloudwatch_dashboard" "ecommerce_dashboard" {
  dashboard_name = "prashaant-ecommerce-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            [ "AWS/ApiGateway", "5XXError", "ApiId", aws_apigatewayv2_api.api.id ],
            [ ".", "4XXError", ".", "." ],
            [ ".", "Count", ".", "." ]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "ap-southeast-1"
          title   = "API Gateway Traffic and Errors"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            [ "AWS/Lambda", "Invocations", "FunctionName", aws_lambda_function.product.function_name ],
            [ ".", ".", ".", aws_lambda_function.cart.function_name ],
            [ ".", ".", ".", aws_lambda_function.order.function_name ]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "ap-southeast-1"
          title   = "Lambda Invocations"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6
        properties = {
          metrics = [
            [ "AWS/Lambda", "Duration", "FunctionName", aws_lambda_function.product.function_name ],
            [ ".", ".", ".", aws_lambda_function.cart.function_name ],
            [ ".", ".", ".", aws_lambda_function.order.function_name ]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "ap-southeast-1"
          title   = "Lambda Duration"
          period  = 300
          stat    = "Average"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 6
        width  = 12
        height = 6
        properties = {
          metrics = [
            [ "AWS/Lambda", "Errors", "FunctionName", aws_lambda_function.product.function_name ],
            [ ".", ".", ".", aws_lambda_function.cart.function_name ],
            [ ".", ".", ".", aws_lambda_function.order.function_name ]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "ap-southeast-1"
          title   = "Lambda Errors"
          period  = 300
        }
      }
    ]
  })
}

# 1. API Gateway 5xx Alarm
resource "aws_cloudwatch_metric_alarm" "apigw_5xx" {
  alarm_name          = "prashaant-apigw-5xx-alarm"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "5XXError"
  namespace           = "AWS/ApiGateway"
  period              = 300
  statistic           = "Sum"
  threshold           = 5
  treat_missing_data  = "notBreaching"
  alarm_description   = "API Gateway 5XX errors > 5 in 5 minutes"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    ApiId = aws_apigatewayv2_api.api.id
  }
}

# 2. API Gateway Latency Alarm
resource "aws_cloudwatch_metric_alarm" "apigw_latency" {
  alarm_name          = "prashaant-apigw-latency-alarm"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Latency"
  namespace           = "AWS/ApiGateway"
  period              = 300
  statistic           = "Average"
  threshold           = 2000
  treat_missing_data  = "notBreaching"
  alarm_description   = "API Gateway Average Latency > 2000ms"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    ApiId = aws_apigatewayv2_api.api.id
  }
}

# 3. Lambda Errors Alarm (Aggregate using Metric Math)
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name          = "prashaant-lambda-errors-alarm"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  threshold           = 2
  treat_missing_data  = "notBreaching"
  alarm_description   = "Aggregate Lambda Errors > 2 in 5 minutes"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  metric_query {
    id          = "e1"
    expression  = "m1 + m2 + m3"
    label       = "Total Errors"
    return_data = true
  }

  metric_query {
    id = "m1"
    metric {
      metric_name = "Errors"
      namespace   = "AWS/Lambda"
      period      = 300
      stat        = "Sum"
      dimensions = {
        FunctionName = aws_lambda_function.product.function_name
      }
    }
  }

  metric_query {
    id = "m2"
    metric {
      metric_name = "Errors"
      namespace   = "AWS/Lambda"
      period      = 300
      stat        = "Sum"
      dimensions = {
        FunctionName = aws_lambda_function.cart.function_name
      }
    }
  }

  metric_query {
    id = "m3"
    metric {
      metric_name = "Errors"
      namespace   = "AWS/Lambda"
      period      = 300
      stat        = "Sum"
      dimensions = {
        FunctionName = aws_lambda_function.order.function_name
      }
    }
  }
}

# 4. Lambda Duration Alarm (Max duration across all)
resource "aws_cloudwatch_metric_alarm" "lambda_duration" {
  alarm_name          = "prashaant-lambda-duration-alarm"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  threshold           = 3000
  treat_missing_data  = "notBreaching"
  alarm_description   = "Max Lambda Duration > 3000ms"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  metric_query {
    id          = "e1"
    expression  = "MAX([m1, m2, m3])"
    label       = "Max Duration"
    return_data = true
  }

  metric_query {
    id = "m1"
    metric {
      metric_name = "Duration"
      namespace   = "AWS/Lambda"
      period      = 300
      stat        = "Maximum"
      dimensions = {
        FunctionName = aws_lambda_function.product.function_name
      }
    }
  }

  metric_query {
    id = "m2"
    metric {
      metric_name = "Duration"
      namespace   = "AWS/Lambda"
      period      = 300
      stat        = "Maximum"
      dimensions = {
        FunctionName = aws_lambda_function.cart.function_name
      }
    }
  }

  metric_query {
    id = "m3"
    metric {
      metric_name = "Duration"
      namespace   = "AWS/Lambda"
      period      = 300
      stat        = "Maximum"
      dimensions = {
        FunctionName = aws_lambda_function.order.function_name
      }
    }
  }
}

# 5. Lambda Throttles Alarm
resource "aws_cloudwatch_metric_alarm" "lambda_throttles" {
  alarm_name          = "prashaant-lambda-throttles-alarm"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  threshold           = 0
  treat_missing_data  = "notBreaching"
  alarm_description   = "Aggregate Lambda Throttles > 0"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  metric_query {
    id          = "e1"
    expression  = "m1 + m2 + m3"
    label       = "Total Throttles"
    return_data = true
  }

  metric_query {
    id = "m1"
    metric {
      metric_name = "Throttles"
      namespace   = "AWS/Lambda"
      period      = 300
      stat        = "Sum"
      dimensions = {
        FunctionName = aws_lambda_function.product.function_name
      }
    }
  }

  metric_query {
    id = "m2"
    metric {
      metric_name = "Throttles"
      namespace   = "AWS/Lambda"
      period      = 300
      stat        = "Sum"
      dimensions = {
        FunctionName = aws_lambda_function.cart.function_name
      }
    }
  }

  metric_query {
    id = "m3"
    metric {
      metric_name = "Throttles"
      namespace   = "AWS/Lambda"
      period      = 300
      stat        = "Sum"
      dimensions = {
        FunctionName = aws_lambda_function.order.function_name
      }
    }
  }
}
