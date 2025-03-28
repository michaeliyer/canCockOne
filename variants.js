// POST /variants → Add new variant
// GET /products/:id/variants → Get variants for a product
// PUT /variants/:id → Update variant (e.g., stock, price, size, etc.)
// DELETE /variants/:id → Delete variant
// PUT /variants/:id/addstock → Increment stock for a variant

// variants.js
import express from 'express';
const router = express.Router();
import db from './db/db.js';

// Add new variant
router.post('/', (req, res) => {
  const { product_id, size, unit_price, units_in_stock, sku } = req.body;
  db.run(
    `INSERT INTO product_variants (product_id, size, unit_price, units_in_stock, sku) VALUES (?, ?, ?, ?, ?)`,
    [product_id, size, unit_price, units_in_stock, sku],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Variant added', variant_id: this.lastID });
    }
  );
});

// Get all variants for a product
router.get('/product/:id', (req, res) => {
  db.all(
    `SELECT * FROM product_variants WHERE product_id = ?`,
    [req.params.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Update variant
router.put('/:id', (req, res) => {
  const { size, unit_price, units_in_stock, sku } = req.body;
  db.run(
    `UPDATE product_variants SET size = ?, unit_price = ?, units_in_stock = ?, sku = ? WHERE variant_id = ?`,
    [size, unit_price, units_in_stock, sku, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Variant updated' });
    }
  );
});

// Delete variant
router.delete('/:id', (req, res) => {
  db.run(
    `DELETE FROM product_variants WHERE variant_id = ?`,
    [req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Variant deleted' });
    }
  );
});

// Add stock to variant
router.put('/:id/addstock', (req, res) => {
  const { quantity } = req.body;
  db.run(
    `UPDATE product_variants SET units_in_stock = units_in_stock + ? WHERE variant_id = ?`,
    [quantity, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Stock added successfully' });
    }
  );
});

export default router;