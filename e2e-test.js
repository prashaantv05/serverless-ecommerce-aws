const axios = require("axios");

// 🔥 YOUR API GATEWAY
const BASE_URL = "https://lcksw1qszg.execute-api.ap-southeast-1.amazonaws.com";

const USER_ID = "u1";

async function runE2ETest() {
  try {
    console.log("🚀 STARTING E2E TEST...\n");

    // =========================
    // 1. GET PRODUCTS
    // =========================
    console.log("📦 Fetching products...");
    const productsRes = await axios.get(`${BASE_URL}/products/`);
    const products = productsRes.data.data;

    if (!products.length) throw new Error("No products found");

    const product = products[0];
    console.log("✔ Product:", product.name);

    // =========================
    // 2. ADD TO CART
    // =========================
    console.log("\n🛒 Adding to cart...");
    await axios.post(`${BASE_URL}/cart/add`, {
      userId: USER_ID,
      productId: product.id,
      quantity: 1
    });

    console.log("✔ Added to cart");

    // =========================
    // 3. GET CART
    // =========================
    console.log("\n📋 Checking cart...");
    const cartRes = await axios.get(`${BASE_URL}/cart/${USER_ID}`);

    if (!cartRes.data.data.length) {
      throw new Error("Cart is empty");
    }

    console.log("✔ Cart verified");

    // =========================
    // 4. CHECKOUT
    // =========================
    console.log("\n💳 Checkout...");
    const orderRes = await axios.post(
      `${BASE_URL}/orders/checkout/${USER_ID}`,
      {
        shippingAddress: "Chennai",
        paymentMethod: "COD"
      }
    );

    const order = orderRes.data.order;

    console.log("✔ Order placed:", order.orderId);

    // =========================
    // 5. VERIFY ORDER
    // =========================
    console.log("\n📦 Verifying order...");
    const verifyRes = await axios.get(`${BASE_URL}/orders/${order.orderId}`);

    if (!verifyRes.data.success) {
      throw new Error("Order verification failed");
    }

    console.log("✔ Order verified");

    console.log("\n🎉 E2E TEST PASSED!");

  } catch (err) {
    console.error("\n❌ E2E FAILED:", err.message);
  }
}

runE2ETest();