# Serverless E-Commerce Platform on AWS

A serverless e-commerce application built using AWS services, Terraform Infrastructure as Code, Node.js microservices, and a modular frontend architecture.

## Features

* Product Management
* Shopping Cart
* Order Management
* Product Comparison
* Pagination
* Responsive UI
* CloudFront + S3 Frontend Hosting
* API Gateway
* AWS Lambda
* DynamoDB
* Terraform Infrastructure as Code

| Service | Endpoint |
|--------|----------|
| Frontend | `https://dx4o02gcthxe4.cloudfront.net` |
| API Gateway | `https://n8jfqgmey7.execute-api.ap-southeast-1.amazonaws.com` |
## Project Structure

serverless-ecommerce-aws/

* frontend/

  * css/
  * js/
  * index.html

* infrastructure/

  * main.tf
  * lambda.tf
  * dynamodb.tf
  * api-gateway.tf
  * iam.tf
  * permissions.tf
  * frontend.tf
  * variables.tf
  * outputs.tf

* services/

  * product/
  * cart/
  * order/

### 📦 Orders
- Full checkout flow — cart → order with stock deduction
- Automatic cart clear after successful order
- Order history per user
- Order status lifecycle: `placed → confirmed → shipped → delivered → cancelled`

### ⚙️ Admin
- Add, update, delete products
- Inventory (stock) management
- Category-based product organization

---

## 🔧 Microservices

| Service | Lambda Function | DynamoDB Table | Responsibility |
|---------|----------------|----------------|----------------|
| Product Service | `product-service` | `Prash_Products` | CRUD operations, stock management |
| Cart Service | `cart-service` | `Prash_Cart` | Cart operations, product validation |
| Order Service | `order-service` | `Prash_Orders` | Checkout, stock deduction, order history |

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS (custom), Vanilla JS |
| Hosting | AWS S3 + CloudFront |
| API Layer | AWS API Gateway (HTTP API) |
| Backend | Node.js + Express (serverless via `serverless-http`) |
| Runtime | AWS Lambda (Node.js 18.x) |
| Database | AWS DynamoDB (NoSQL, PAY_PER_REQUEST) |
| IaC | Terraform |
| Testing | Jest + Supertest (unit), custom E2E script |

---

## 📁 Project Structure

```
terraform-ecommerce/
│
├── README.md                 # Project documentation
├── .gitignore                # Ignored files list
├── package.json              # Node.js dependencies
├── package-lock.json         # Dependency lock file
├── e2e-test.js               # End-to-end testing script
│
├── product-services/         # Product microservice (Node.js)
│   ├── index.js
│   ├── dynamo.js
│   ├── productRoutes.js
│   └── node_modules/
│
├── cart-services/            # Cart microservice (Node.js)
│   ├── index.js
│   ├── cartRoutes.js
│   ├── node_modules/
│
├── order-services/           # Order microservice (Node.js)
│   ├── index.js
│   ├── orderRoutes.js
│   ├── node_modules/
│
├── frontend.tf               # Terraform config for frontend (S3 / hosting)
├── main.tf                   # Main Terraform infrastructure config
├── variables.tf              # Terraform variables
├── outputs.tf                # Terraform outputs
│
├── index.html                # Frontend UI
├── style.css                 # Styling for frontend
│
├── terraform.tfstate         # Terraform state file (should be ignored in prod)
├── terraform.tfstate.backup  # Backup state file
├── .terraform/               # Terraform internal files
├── .terraform.lock.hcl       # Provider lock file
│
└── node_modules/             # Installed dependencies (ignored in Git)
```

---

## 📡 API Reference

### Product Service

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/products` | Get all products |
| `GET` | `/products/:id` | Get product by ID |
| `POST` | `/products` | Create new product |
| `PUT` | `/products/:id` | Update product (any field) |
| `DELETE` | `/products/:id` | Delete product |

**POST `/products` — Request Body:**
```json
{
  "name": "Running Shoes",
  "price": 2000,
  "stock": 30,
  "category": "sports",
  "description": "Lightweight running shoes"
}
```

---

### Cart Service

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/cart/add` | Add item (fetches product details automatically) |
| `GET` | `/cart/:userId` | Get cart for user |
| `PUT` | `/cart/:userId/update` | Update item quantity |
| `DELETE` | `/cart/:userId/remove/:productId` | Remove specific item |
| `DELETE` | `/cart/:userId/clear` | Clear entire cart |

**POST `/cart/add` — Request Body:**
```json
{
  "userId": "u1",
  "productId": "p1234567890",
  "quantity": 2
}
```

> Cart service automatically calls product-service to fetch name and price — you only need to send `userId`, `productId`, and `quantity`.

---

### Order Service

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/orders/checkout/:userId` | Place order from cart |
| `GET` | `/orders/user/:userId` | Get all orders for user |
| `GET` | `/orders/:id` | Get order by ID |
| `PUT` | `/orders/:id/status` | Update order status |
| `DELETE` | `/orders/:id/cancel` | Cancel an order |

**POST `/orders/checkout/:userId` — Request Body:**
```json
{
  "shippingAddress": "12, Anna Nagar, Chennai",
  "paymentMethod": "COD"
}
```

**Checkout flow (automated):**
1. Fetches all items from user's cart
2. Validates stock for each item
3. Deducts stock from `Prash_Products`
4. Creates order record
5. Clears the cart

---

## 🚀 Deployment

### Prerequisites

- Node.js 18+
- Terraform CLI
- AWS CLI configured with appropriate credentials

### Steps
## Deployment

```bash
terraform init
terraform plan
terraform apply
```

## Tech Stack

* HTML
* CSS
* JavaScript
* Node.js
* AWS Lambda
* API Gateway
* DynamoDB
* S3
* CloudFront
* Terraform
