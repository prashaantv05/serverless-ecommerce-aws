const express = require("express");
const router = express.Router();
const axios = require("axios");

const AWS = require("aws-sdk");

// 🔥 REGION
AWS.config.update({ region: "ap-southeast-1" });

const dynamo = new AWS.DynamoDB.DocumentClient();

const TABLE = "Prash_Cart-Terraform";
const PRODUCT_API = "https://lcksw1qszg.execute-api.ap-southeast-1.amazonaws.com/products";

// ================= ADD TO CART =================
router.post("/add", async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { userId, productId, quantity } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        error: "userId and productId required"
      });
    }

    const qty = quantity || 1;

    // 🔥 STEP 1: FETCH PRODUCT
    const response = await axios.get(`${PRODUCT_API}/${productId}`);
    const product = response.data.data;

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found"
      });
    }

    // 🔥 STEP 2: STOCK VALIDATION
    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        error: "Out of stock"
      });
    }

    // 🔥 STEP 3: CHECK EXISTING CART ITEM
    const existing = await dynamo.get({
      TableName: TABLE,
      Key: {
        userId,
        productId
      }
    }).promise();

    let currentQty = existing.Item ? existing.Item.quantity : 0;
    let newQty = currentQty + qty;

    // 🔥 STEP 4: PREVENT OVER-ADDING
    if (newQty > product.stock) {
      return res.status(400).json({
        success: false,
        error: `Only ${product.stock} items available in stock`
      });
    }

    // 🔥 STEP 5: UPDATE / INSERT
    if (existing.Item) {
      await dynamo.update({
        TableName: TABLE,
        Key: { userId, productId },
        UpdateExpression: "set quantity = :q",
        ExpressionAttributeValues: {
          ":q": newQty
        }
      }).promise();
    } else {
      await dynamo.put({
        TableName: TABLE,
        Item: {
          userId,
          productId,
          name: product.name,
          price: product.price,
          quantity: qty
        }
      }).promise();
    }

    res.json({
      success: true,
      message: "Added to cart"
    });

  } catch (err) {
    console.log("ERROR:", err);

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});


// ================= GET CART =================
router.get("/:userId", async (req, res) => {
  try {
    const data = await dynamo.query({
      TableName: TABLE,
      KeyConditionExpression: "userId = :u",
      ExpressionAttributeValues: {
        ":u": req.params.userId
      }
    }).promise();

    res.json({
      success: true,
      data: data.Items
    });

  } catch (err) {
    console.log("GET ERROR:", err);

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});


// ================= CLEAR CART =================
router.delete("/:userId", async (req, res) => {
  try {
    const data = await dynamo.query({
      TableName: TABLE,
      KeyConditionExpression: "userId = :u",
      ExpressionAttributeValues: {
        ":u": req.params.userId
      }
    }).promise();

    for (let item of data.Items) {
      await dynamo.delete({
        TableName: TABLE,
        Key: {
          userId: item.userId,
          productId: item.productId
        }
      }).promise();
    }

    res.json({
      success: true,
      message: "Cart cleared"
    });

  } catch (err) {
    console.log("DELETE ERROR:", err);

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;