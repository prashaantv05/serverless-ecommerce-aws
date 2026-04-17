# KART — Serverless E-Commerce Platform

> A cloud-native, production-style serverless e-commerce application built on AWS using a microservices architecture — featuring real-time stock validation, automatic cart management, and full order lifecycle tracking.

---

## 🌐 Live Demo

| Service | Endpoint |
|--------|----------|
| Frontend | Hosted on AWS S3 + CloudFront |
| API Gateway | `https://lcksw1qszg.execute-api.ap-southeast-1.amazonaws.com` |

---

## 🏗️ Architecture

```
Browser (HTML/CSS/JS)
        │
        ▼
  CloudFront (CDN)
        │
        ▼
  S3 Static Website
        │
        ▼
  API Gateway (HTTP API)
   ┌────┴────────────┐──────────────────┐
   ▼                 ▼                  ▼
Lambda            Lambda             Lambda
(product-service) (cart-service)    (order-service)
   │                 │                  │
   └────────┬────────┘──────────────────┘
            ▼
        DynamoDB
  ┌──────────────────────┐
  │  Prash_Products      │
  │  Prash_Cart          │
  │  Prash_Orders        │
  └──────────────────────┘
```

---

## ✨ Features

### 🛍️ Shopping
- Browse full product catalog with category filtering
- Real-time stock availability display
- One-click add to cart from product listing
- Quantity management inside cart

### 🛒 Cart
- Persistent cart using DynamoDB (survives Lambda cold starts)
- Auto-fetches product details (name, price) during add-to-cart
- Stock validation before adding items
- Duplicate item detection — increases quantity instead of duplicate entry

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
kart/
│
├── product-services/
│   ├── index.js               # Lambda handler
│   ├── productRoutes.js       # CRUD routes
│   ├── dynamo.js              # DynamoDB client
│   ├── package.json
│   └── __tests__/
│       └── product.test.js
│
├── cart-services/
│   ├── index.js               # Lambda handler
│   ├── cartRoutes.js          # Cart routes + product fetch
│   ├── package.json
│   └── __tests__/
│       └── cart.test.js
│
├── order-services/
│   ├── index.js               # Lambda handler
│   ├── orderRoutes.js         # Checkout + order routes
│   ├── orderDB.js             # In-memory order store
│   ├── package.json
│   └── __tests__/
│       └── order.test.js
│
├── index.html                 # Frontend entry point
├── app.js                     # Frontend JS (API calls)
├── style.css                  # Frontend styles
│
├── main.tf                    # Lambda, API Gateway, DynamoDB, IAM
├── frontend.tf                # S3 + CloudFront
├── variables.tf
├── outputs.tf
│
├── e2e-test.js                # End-to-end test runner
└── README.md
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

```bash
# 1. Clone the repository
git clone https://github.com/prashaant/kart.git
cd kart

# 2. Install dependencies for each service
cd product-services && npm install && cd ..
cd cart-services && npm install && cd ..
cd order-services && npm install && cd ..

# 3. Deploy infrastructure
terraform init
terraform plan
terraform apply
```

Terraform provisions:
- 3 Lambda functions
- API Gateway (HTTP API) with all routes
- 3 DynamoDB tables
- IAM role with DynamoDB access
- S3 bucket + CloudFront for frontend
- Lambda permissions for API Gateway

---

## 🧪 Testing

### Unit Tests

```bash
# Product service
cd product-services && npm test

# Cart service
cd cart-services && npm test

# Order service
cd order-services && npm test
```

### End-to-End Tests

```bash
node e2e-test.js
```

**E2E coverage:**
- Full product lifecycle (create → read → update → delete)
- Add to cart with stock validation
- Cart operations (add, update, remove, clear)
- Checkout flow with stock deduction
- Order status updates
- Edge cases: empty cart checkout, out-of-stock items

---

## 🧠 Key Design Decisions

| Decision | Reason |
|----------|--------|
| Lambda over EC2 | Zero server management, auto-scaling, pay-per-use |
| DynamoDB over RDS | Serverless-native, single-digit ms latency, no connection pooling |
| HTTP API Gateway over REST | Lower cost, lower latency for this use case |
| Terraform for IaC | Reproducible, version-controlled infrastructure |
| `serverless-http` wrapper | Reuse Express routes without rewriting for Lambda event format |
| `crypto.randomUUID()` over `uuid` pkg | Built-in Node.js 18+, zero dependency, avoids ESM/CJS conflicts |

---

## 🏛️ Architectural Principles

### Stateless Design
Each Lambda invocation is independent — no session or in-memory state shared between requests.

### Loosely Coupled Microservices
Services communicate only via REST API calls — cart-service calls product-service API, not the database directly.

### API-First
Frontend communicates exclusively via REST API. UI is completely decoupled from backend.

### Idempotency
`PUT` and `DELETE` operations are safe to retry — repeated calls produce the same result.

---

## 🔒 Security

### Current
- Input validation on all API endpoints
- API Gateway as controlled entry point
- IAM roles with least-privilege DynamoDB access

### Planned Enhancements
- JWT-based authentication
- AWS Cognito user pools
- Role-based access control (user vs admin)
- API rate limiting
- AWS WAF integration

---

## ⚠️ Known Limitations

- No authentication layer (all endpoints are public)
- Order data stored in-memory (resets on Lambda cold start) — DynamoDB migration planned
- No rate limiting on API Gateway
- No centralized logging (CloudWatch not yet configured)

---

## 🚀 Roadmap

- [ ] JWT authentication + AWS Cognito
- [ ] Order persistence in DynamoDB
- [ ] CloudWatch dashboards & alerts
- [ ] CI/CD pipeline via GitHub Actions
- [ ] OpenAPI (Swagger) documentation
- [ ] API versioning (`/v1/`)
- [ ] SQS-based event-driven order processing
- [ ] Product search & filtering
- [ ] User profile management

---

## 👨‍💻 Author

**Prashaant V**
Cloud & Backend Developer
[github.com/prashaant](https://github.com/prashaant)

---

## ⭐ About This Project

KART demonstrates a **production-aligned serverless architecture** — combining microservices design, cloud-native infrastructure-as-code, REST API design, and a responsive frontend. Built to reflect real-world engineering practices used at product companies.

---

*Built with ☕ and AWS Lambda cold starts.*
