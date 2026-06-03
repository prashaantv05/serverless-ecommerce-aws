resource "aws_sqs_queue" "alerts_queue" {
  name = "prashaant-alerts-queue"
}

resource "aws_sns_topic_subscription" "alerts_sqs_target" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.alerts_queue.arn
}

resource "aws_sqs_queue_policy" "alerts_queue_policy" {
  queue_url = aws_sqs_queue.alerts_queue.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "sns.amazonaws.com"
        }
        Action   = "sqs:SendMessage"
        Resource = aws_sqs_queue.alerts_queue.arn
        Condition = {
          ArnEquals = {
            "aws:SourceArn" = aws_sns_topic.alerts.arn
          }
        }
      }
    ]
  })
}
