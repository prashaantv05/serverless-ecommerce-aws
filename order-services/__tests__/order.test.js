// 🔥 MOCK AWS SDK
jest.mock("aws-sdk", () => {
  const mDocumentClient = {
    // 🔥 GET CART (query)
    query: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({
        Items: [
          { userId: "u1", productId: "p1", quantity: 2, price: 100 }
        ]
      })
    }),

    // 🔥 UPDATE STOCK
    update: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({})
    }),

    // 🔥 CREATE ORDER
    put: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({})
    }),

    // 🔥 CLEAR CART
    delete: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({})
    }),

    // 🔥 GET ORDER BY ID
    get: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({
        Item: {
          orderId: "o1",
          userId: "u1",
          total: 200
        }
      })
    }),

    // 🔥 GET ORDERS BY USER
    scan: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({
        Items: [
          { orderId: "o1", userId: "u1", total: 200 }
        ]
      })
    })
  };

  return {
    DynamoDB: {
      DocumentClient: jest.fn(() => mDocumentClient)
    },
    config: {
      update: jest.fn()
    }
  };
});

const request = require("supertest");
const express = require("express");

const routes = require("../orderRoutes");

const app = express();
app.use(express.json());
app.use("/orders", routes);

describe("Order API Tests", () => {

  // ✅ SUCCESS CHECKOUT
  test("POST /orders/checkout/:userId → success", async () => {
    const res = await request(app)
      .post("/orders/checkout/u1")
      .send({
        shippingAddress: "Chennai",
        paymentMethod: "COD"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.order).toBeDefined();
  });

  // ❌ EMPTY CART
  test("POST /orders/checkout/:userId → empty cart", async () => {
    const AWS = require("aws-sdk");
    const dynamo = new AWS.DynamoDB.DocumentClient();

    // override query for empty cart
    dynamo.query.mockReturnValueOnce({
      promise: jest.fn().mockResolvedValue({
        Items: []
      })
    });

    const res = await request(app)
      .post("/orders/checkout/u1")
      .send({});

    expect(res.statusCode).toBe(400);
  });

  // ✅ GET ORDER BY ID
  test("GET /orders/:orderId → success", async () => {
    const res = await request(app).get("/orders/o1");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderId).toBe("o1");
  });

  // ❌ ORDER NOT FOUND
  test("GET /orders/:orderId → not found", async () => {
    const AWS = require("aws-sdk");
    const dynamo = new AWS.DynamoDB.DocumentClient();

    dynamo.get.mockReturnValueOnce({
      promise: jest.fn().mockResolvedValue({})
    });

    const res = await request(app).get("/orders/invalid");

    expect(res.statusCode).toBe(404);
  });

  // ✅ GET ORDERS BY USER
  test("GET /orders/user/:userId → success", async () => {
    const res = await request(app).get("/orders/user/u1");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

});