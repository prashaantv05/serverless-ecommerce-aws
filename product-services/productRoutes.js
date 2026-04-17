// ============================================================
//  PRODUCT SERVICE — Routes
//  Each function here is what becomes a Lambda handler on AWS
// ============================================================

const express = require("express");
const router  = express.Router();
const dynamo = require("./dynamo");

router.get("/", async (req, res) => {
  try {
    const params = {
      TableName: "Prash_Products-Terraform"
    };

    const data = await dynamo.scan(params).promise();

    res.json({
      success: true,
      count: data.Items.length,
      data: data.Items
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const params = {
      TableName: "Prash_Products-Terraform",
      Key: { id: req.params.id }
    };

    const data = await dynamo.get(params).promise();

    if (!data.Item) {
      return res.status(404).json({
        success: false,
        error: "Product not found"
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

// ── POST /products ────────────────────────────────────────
// Create a new product
// Body: { name, description, price, stock, category }
router.post("/", async (req, res) => {
  try {
    const newProduct = {
      id: "p" + Date.now(),
      ...req.body
    };

    const params = {
      TableName: "Prash_Products-Terraform",
      Item: newProduct
    };

    await dynamo.put(params).promise();

    res.status(201).json({
      success: true,
      message: "Product created",
      data: newProduct
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── PUT /products/:id ─────────────────────────────────────
// Update an existing product
router.put("/:id", async (req, res) => {
  try {
    const body = req.body;

    let updateExp = "SET ";
    let attrValues = {};
    let attrNames = {};
    let updates = [];

    const fields = ["name", "price", "category", "stock", "description"];

    fields.forEach(field => {
      if (body[field] !== undefined) {
        const key = "#" + field;
        const val = ":" + field;

        updates.push(`${key} = ${val}`);
        attrNames[key] = field;

        // 🔥 IMPORTANT FIX
        attrValues[val] = field === "stock" ? Number(body[field]) : body[field];
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No fields provided"
      });
    }

    updateExp += updates.join(", ");

    const params = {
      TableName: "Prash_Products-Terraform",
      Key: { id: req.params.id },
      UpdateExpression: updateExp,
      ExpressionAttributeNames: attrNames,
      ExpressionAttributeValues: attrValues,
      ReturnValues: "ALL_NEW"
    };

    const data = await dynamo.update(params).promise();

    res.json({
      success: true,
      message: "Updated",
      data: data.Attributes
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});
// ── DELETE /products/:id ──────────────────────────────────
// Delete a product
router.delete("/:id", async (req, res) => {
  try {
    const params = {
      TableName: "Prash_Products-Terraform",
      Key: { id: req.params.id }
    };

    await dynamo.delete(params).promise();

    res.json({
      success: true,
      message: "Deleted"
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
