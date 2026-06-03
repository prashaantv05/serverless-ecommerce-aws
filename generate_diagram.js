const fs = require('fs');

const puml = `@startuml
!include <awslib/AWSCommon>
!include <awslib/SecurityIdentityAndCompliance/Cognito>
!include <awslib/NetworkingAndContentDelivery/CloudFront>
!include <awslib/Storage/SimpleStorageService>
!include <awslib/ApplicationIntegration/APIGateway>
!include <awslib/Compute/Lambda>
!include <awslib/Database/DynamoDB>
!include <awslib/ManagementAndGovernance/CloudWatch>
!include <awslib/ApplicationIntegration/SimpleNotificationService>
!include <awslib/ApplicationIntegration/SimpleQueueService>
!include <awslib/General/User>

left to right direction
skinparam BackgroundColor transparent
skinparam componentStyle uml2

User(user, "Customer / Admin", "Web Browser")

rectangle "Frontend Hosting" {
    CloudFront(cf, "CloudFront", "CDN")
    SimpleStorageService(s3, "Amazon S3", "Static Assets")
}

rectangle "Authentication" {
    Cognito(cognito, "Amazon Cognito", "User Pools & Identity")
}

rectangle "API Layer" {
    APIGateway(api, "API Gateway", "REST APIs")
}

rectangle "Microservices (Serverless)" {
    Lambda(lambda_prod, "Product Service", "Node.js")
    Lambda(lambda_cart, "Cart Service", "Node.js")
    Lambda(lambda_ord, "Order Service", "Node.js")
}

rectangle "Database Layer" {
    DynamoDB(db_prod, "Products Table", "NoSQL")
    DynamoDB(db_cart, "Cart Table", "NoSQL")
    DynamoDB(db_ord, "Orders Table", "NoSQL")
}

rectangle "Observability & Events" {
    CloudWatch(cw, "CloudWatch", "Alarms & Logs")
    SimpleNotificationService(sns, "Amazon SNS", "Alerts Topic")
    SimpleQueueService(sqs, "Amazon SQS", "Event Queue")
}

user --> cf : "HTTPS"
cf --> s3 : "Fetch Assets"
user --> cognito : "Auth / JWT"
user --> api : "REST Calls"

api --> lambda_prod
api --> lambda_cart
api --> lambda_ord

lambda_prod --> db_prod
lambda_cart --> db_cart
lambda_ord --> db_ord

lambda_prod -.-> cw : "Metrics/Errors"
lambda_cart -.-> cw : "Metrics/Errors"
lambda_ord -.-> cw : "Metrics/Errors"
api -.-> cw : "API Logs"

cw --> sns : "Trigger Alarms"
sns --> sqs : "Fanout Events"

@enduml`;

fetch('https://kroki.io/plantuml/svg', {
    method: 'POST',
    body: puml,
    headers: { 'Content-Type': 'text/plain' }
})
.then(res => {
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.text();
})
.then(text => {
    fs.writeFileSync('architecture.svg', text);
    console.log('Successfully generated architecture.svg');
})
.catch(err => console.error('Failed to generate diagram:', err));
