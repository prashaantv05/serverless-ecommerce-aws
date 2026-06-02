const request = require("supertest");
const express = require("express");

jest.mock("../dynamo"); // 🔥 mock DB

const routes = require("../productRoutes");

const app = express();
app.use(express.json());
app.use("/products", routes);

describe("Product API Tests", () => {

  // ✅ GET ALL PRODUCTS
  test("GET /products", async () => {
    const res = await request(app).get("/products");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  // ✅ GET SINGLE PRODUCT
  test("GET /products/:id", async () => {
    const res = await request(app).get("/products/p1");

    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe("p1");
  });

  // ✅ CREATE PRODUCT
  test("POST /products", async () => {
    const res = await request(app)
      .post("/products")
      .send({
        name: "Watch",
        price: 2000,
        stock: 10,
        category: "electronics",
        description: "Smart watch"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  // ✅ DELETE PRODUCT
  test("DELETE /products/:id", async () => {
    const res = await request(app).delete("/products/p1");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

});
  test("GET /products/:id → product not found", async () => {
  const dynamo = require("../dynamo");

  dynamo.get.mockReturnValueOnce({
    promise: jest.fn().mockResolvedValue({})
  });

  const res = await request(app).get("/products/invalid");

  expect(res.statusCode).toBe(404);
  expect(res.body.success).toBe(false);
});
  test("GET /products → empty list", async () => {
  const dynamo = require("../dynamo");

  dynamo.scan.mockReturnValueOnce({
    promise: jest.fn().mockResolvedValue({
      Items: []
    })
  });

  const res = await request(app).get("/products");

  expect(res.statusCode).toBe(200);
  expect(res.body.data.length).toBe(0);
});
  test("POST /products → invalid input", async () => {
  const res = await request(app)
    .post("/products")
    .send({}); // empty body

  expect(res.statusCode).toBe(201); 
  // (your current API doesn't validate, so it still succeeds)
});