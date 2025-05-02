// POST /products → Add new product
// GET /products → Get all products
// PUT /products/:id → Update product
// DELETE /products/:id → Delete product

// products.js
import express from "express";
const router = express.Router();
import initDB from "./db/db.js";

let db = null;

// Initialize database connection
const init = async () => {
  db = await initDB();
};
init().catch(console.error);

// Add new product
router.post("/", async (req, res) => {
  if (!db) {
    return res.status(500).json({ error: "Database not initialized" });
  }

  const { name, description, basePrice, sku, category } = req.body;
  console.log("Received product data:", {
    name,
    description,
    basePrice,
    sku,
    category,
  });

  // Validate required fields
  if (!name || !basePrice || !sku) {
    return res
      .status(400)
      .json({ error: "Name, base price, and SKU are required" });
  }

  // Validate price is a positive number
  if (isNaN(basePrice) || basePrice < 0) {
    return res
      .status(400)
      .json({ error: "Base price must be a positive number" });
  }

  try {
    const sql = `INSERT INTO products (name, description, base_price, sku, category) VALUES (?, ?, ?, ?, ?)`;
    const params = [name, description, basePrice, sku, category];
    console.log("Executing SQL:", sql);
    console.log("With parameters:", params);

    const result = await db.exec(sql, params);
    const { lastID } = await db.get("SELECT last_insert_rowid() as lastID");
    console.log("Product added successfully, ID:", lastID);

    res.json({
      message: "Product added successfully",
      product_id: lastID,
      product: {
        id: lastID,
        name,
        description,
        basePrice,
        sku,
        category,
      },
    });
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({
      error: err.message,
      details: {
        code: err.code,
        errno: err.errno,
      },
    });
  }
});

// Get all products
router.get("/", async (req, res) => {
  if (!db) {
    return res.status(500).json({ error: "Database not initialized" });
  }

  try {
    const sql = `
      SELECT 
        product_id as id,
        name,
        description,
        base_price as basePrice,
        sku,
        category
      FROM products 
      ORDER BY name
    `;
    console.log("Executing SQL:", sql);

    const rows = await db.all(sql);
    console.log("Found products:", rows);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: err.message });
  }
});

// Update product
router.put("/:id", async (req, res) => {
  if (!db) {
    return res.status(500).json({ error: "Database not initialized" });
  }

  const { name, description, basePrice, sku, category } = req.body;

  // Validate required fields
  if (!name || !basePrice || !sku) {
    return res
      .status(400)
      .json({ error: "Name, base price, and SKU are required" });
  }

  // Validate price is a positive number
  if (isNaN(basePrice) || basePrice < 0) {
    return res
      .status(400)
      .json({ error: "Base price must be a positive number" });
  }

  try {
    const sql = `
      UPDATE products 
      SET name = ?, description = ?, base_price = ?, sku = ?, category = ? 
      WHERE product_id = ?
    `;
    const params = [name, description, basePrice, sku, category, req.params.id];
    console.log("Executing SQL:", sql);
    console.log("With parameters:", params);

    await db.exec(sql, params);
    const { changes } = await db.get("SELECT changes() as changes");

    // Check if the product was found and updated
    if (changes === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({
      message: "Product updated successfully",
      product: {
        id: req.params.id,
        name,
        description,
        basePrice,
        sku,
        category,
      },
    });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: err.message });
  }
});

// Delete product
router.delete("/:id", async (req, res) => {
  if (!db) {
    return res.status(500).json({ error: "Database not initialized" });
  }

  try {
    const sql = `DELETE FROM products WHERE product_id = ?`;
    const params = [req.params.id];
    console.log("Executing SQL:", sql);
    console.log("With parameters:", params);

    await db.exec(sql, params);
    const { changes } = await db.get("SELECT changes() as changes");

    // Check if the product was found and deleted
    if (changes === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
