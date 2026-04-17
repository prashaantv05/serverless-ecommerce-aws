jest.mock("aws-sdk", () => {
  const mDocumentClient = {
    get: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({})
    }),
    put: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({})
    }),
    update: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({})
    }),
    query: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({
        Items: [
          { userId: "u1", productId: "p1", quantity: 2 }
        ]
      })
    }),
    delete: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({})
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
jest.mock("axios", () => ({
  get: jest.fn(() =>
    Promise.resolve({
      data: {
        data: {
          id: "p1",
          name: "Test Product",
          price: 100,
          stock: 5
        }
      }
    })
  )
}));

const request = require("supertest");
const express = require("express");

const routes = require("../cartRoutes");

const app = express();
app.use(express.json());
app.use("/cart", routes);

describe("Cart API Tests", () => {

  // ✅ ADD TO CART
  test("POST /cart/add → success", async () => {
    const res = await request(app)
      .post("/cart/add")
      .send({
        userId: "u1",
        productId: "p1",
        quantity: 1
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // ❌ OUT OF STOCK
  test("POST /cart/add → out of stock", async () => {
    const axios = require("axios");

    axios.get.mockResolvedValueOnce({
      data: {
        data: {
          id: "p1",
          stock: 0
        }
      }
    });

    const res = await request(app)
      .post("/cart/add")
      .send({
        userId: "u1",
        productId: "p1",
        quantity: 1
      });

    expect(res.statusCode).toBe(400);
  });

  // ❌ EXCEED STOCK
  test("POST /cart/add → exceed stock", async () => {
  const axios = require("axios");
  const AWS = require("aws-sdk");

  const dynamo = new AWS.DynamoDB.DocumentClient();

  axios.get.mockResolvedValueOnce({
    data: {
      data: {
        id: "p1",
        stock: 2
      }
    }
  });

  dynamo.get.mockReturnValueOnce({
    promise: jest.fn().mockResolvedValue({
      Item: { quantity: 2 }
    })
  });

  const res = await request(app)
    .post("/cart/add")
    .send({
      userId: "u1",
      productId: "p1",
      quantity: 1
    });

  expect(res.statusCode).toBe(400);
});

  // ✅ GET CART
  test("GET /cart/:userId", async () => {
    const res = await request(app).get("/cart/u1");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // ✅ CLEAR CART
  test("DELETE /cart/:userId", async () => {
    const res = await request(app).delete("/cart/u1");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

});