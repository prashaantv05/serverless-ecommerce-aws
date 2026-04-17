const express = require("express");
const router = express.Router();
const AWS = require("aws-sdk");

AWS.config.update({ region: "ap-southeast-1" });

const dynamo = new AWS.DynamoDB.DocumentClient();

const CART_TABLE = "Prash_Cart-Terraform";
const PRODUCT_TABLE = "Prash_Products-Terraform";
const ORDER_TABLE = "Prash_Orders-Terraform";

// ================= CHECKOUT =================
router.post("/checkout/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { shippingAddress, paymentMethod } = req.body;

    // 🔥 1. GET CART ITEMS
    const cartData = await dynamo.query({
      TableName: CART_TABLE,
      KeyConditionExpression: "userId = :u",
      ExpressionAttributeValues: {
        ":u": userId
      }
    }).promise();

    const cartItems = cartData.Items;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Cart is empty"
      });
    }

    // 🔥 2. CALCULATE TOTAL
    let total = 0;
    cartItems.forEach(item => {
      total += item.price * item.quantity;
    });

    // 🔥 3. REDUCE STOCK
    for (let item of cartItems) {
      await dynamo.update({
        TableName: PRODUCT_TABLE,
        Key: { id: item.productId },
        UpdateExpression: "SET stock = stock - :q",
        ExpressionAttributeValues: {
          ":q": item.quantity
        }
      }).promise();
    }

    // 🔥 4. CREATE ORDER
    const orderId = "o" + Date.now();

    const order = {
      orderId,
      userId,
      items: cartItems,
      total,
      shippingAddress,
      paymentMethod,
      createdAt: new Date().toISOString()
    };

    await dynamo.put({
      TableName: ORDER_TABLE,
      Item: order
    }).promise();

    // 🔥 5. CLEAR CART
    for (let item of cartItems) {
      await dynamo.delete({
        TableName: CART_TABLE,
        Key: {
          userId: item.userId,
          productId: item.productId
        }
      }).promise();
    }

    res.json({
      success: true,
      message: "Order placed successfully",
      order
    });

  } catch (err) {
    console.log("ERROR:", err);

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});


// ================= GET ORDER BY ID =================
router.get("/:orderId", async (req, res) => {
  try {
    const data = await dynamo.get({
      TableName: ORDER_TABLE,
      Key: { orderId: req.params.orderId }
    }).promise();

    if (!data.Item) {
      return res.status(404).json({
        success: false,
        error: "Order not found"
      });
    }

    res.json({
      success: true,
      data: data.Item
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// ================= GET ORDERS BY USER =================
router.get("/user/:userId", async (req, res) => {
  try {
    const data = await dynamo.scan({
      TableName: ORDER_TABLE,
      FilterExpression: "userId = :u",
      ExpressionAttributeValues: {
        ":u": req.params.userId
      }
    }).promise();

    res.json({
      success: true,
      data: data.Items
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;