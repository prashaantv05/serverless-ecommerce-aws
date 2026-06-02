# 🛒 Serverless E-Commerce Platform on AWS

A cloud-native e-commerce application built using AWS serverless services, Terraform Infrastructure as Code (IaC), Node.js microservices, and a modular frontend architecture.

This project demonstrates modern cloud engineering practices including serverless architecture, Infrastructure as Code, microservices, CDN-based frontend delivery, and automated AWS resource provisioning.

---

## 🌐 Live Deployment

| Service     | URL                                                         |
| ----------- | ----------------------------------------------------------- |
| Frontend    | https://dx4o02gcthxe4.cloudfront.net                        |
| API Gateway | https://n8jfqgmey7.execute-api.ap-southeast-1.amazonaws.com |

The frontend is hosted on Amazon S3 and delivered globally through Amazon CloudFront. Backend APIs are exposed through Amazon API Gateway and powered by AWS Lambda microservices.

---

## 🚀 Features

### Customer Features

* Product Catalog Management
* Product Search & Filtering
* Product Comparison
* Shopping Cart Management
* Order Placement & Tracking
* Order History
* Responsive User Interface

### Admin Features

* Add Products
* Update Products
* Delete Products
* Inventory Management
* Category Management

### Cloud Features

* Serverless Architecture
* Terraform Infrastructure as Code
* CloudFront CDN Distribution
* S3 Static Website Hosting
* API Gateway REST APIs
* DynamoDB NoSQL Database
* AWS Lambda Microservices

---

## 🏗️ Architecture

```text
User
 │
 ▼
CloudFront
 │
 ▼
Amazon S3 (Frontend)
 │
 ▼
API Gateway
 │
 ├── Product Service (Lambda)
 ├── Cart Service (Lambda)
 └── Order Service (Lambda)
        │
        ▼
     DynamoDB
```

---

## ☁️ AWS Services Used

| Service            | Purpose                                    |
| ------------------ | ------------------------------------------ |
| AWS Lambda         | Serverless backend microservices           |
| Amazon API Gateway | REST API management                        |
| Amazon DynamoDB    | NoSQL data storage                         |
| Amazon S3          | Static frontend hosting                    |
| Amazon CloudFront  | Global content delivery                    |
| AWS IAM            | Security and access control                |
| Terraform          | Infrastructure provisioning and management |

---

## 🛠️ Technology Stack

### Frontend

* HTML5
* CSS3
* JavaScript (ES6)

### Backend

* Node.js
* Express.js

### Cloud & Infrastructure

* AWS Lambda
* Amazon API Gateway
* Amazon DynamoDB
* Amazon S3
* Amazon CloudFront
* AWS IAM
* Terraform

### Testing

* Jest
* Supertest

---

## 📂 Project Structure

```text
serverless-ecommerce-aws/

├── frontend/
│   ├── css/
│   ├── js/
│   └── index.html
│
├── infrastructure/
│   ├── main.tf
│   ├── lambda.tf
│   ├── dynamodb.tf
│   ├── api-gateway.tf
│   ├── iam.tf
│   ├── permissions.tf
│   ├── frontend.tf
│   ├── variables.tf
│   └── outputs.tf
│
├── services/
│   ├── product/
│   ├── cart/
│   └── order/
│
├── README.md
└── .gitignore
```

---

## ⚙️ Deployment

```bash
terraform init
terraform plan
terraform apply
```

Terraform provisions:

* AWS Lambda Functions
* API Gateway
* DynamoDB Tables
* S3 Bucket
* CloudFront Distribution
* IAM Roles and Policies

---

## 🧪 Testing

Run service-level unit tests using Jest:

```bash
cd services/product
npm test

cd ../cart
npm test

cd ../order
npm test
```

---

## 📚 Learning Outcomes

This project demonstrates practical experience with:

* Serverless Architecture
* AWS Cloud Services
* Infrastructure as Code (Terraform)
* Microservices Design
* REST API Development
* DynamoDB Data Modeling
* Frontend Modularization
* Cloud Deployment & Automation

---

## 🔮 Future Enhancements

* AWS WAF Integration
* Amazon SQS for Order Processing
* CloudWatch Monitoring & Observability
* GitHub Actions CI/CD Pipeline
* Amazon Cognito Authentication
* Gamification & Reward System

---

## 👨‍💻 Author

**Prashaant V**

Built as a cloud-native serverless e-commerce platform to demonstrate AWS, Terraform, Serverless Architecture, and Microservices best practices.
