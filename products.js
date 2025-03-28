// POST /products → Add new product
// GET /products → Get all products
// PUT /products/:id → Update product
// DELETE /products/:id → Delete product

// products.js
import express from 'express';
const router = express.Router();
import db from './db/db.js';

// Add new product
router.post('/', (req, res) => {
  const { name, description, category } = req.body;
  db.run(
    `INSERT INTO products (name, description, category) VALUES (?, ?, ?)`,
    [name, description, category],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Product added', product_id: this.lastID });
    }
  );
});

// Get all products
router.get('/', (req, res) => {
  db.all(`SELECT * FROM products ORDER BY name`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Update product
router.put('/:id', (req, res) => {
  const { name, description, category } = req.body;
  db.run(
    `UPDATE products SET name = ?, description = ?, category = ? WHERE product_id = ?`,
    [name, description, category, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Product updated' });
    }
  );
});

// Delete product
router.delete('/:id', (req, res) => {
  db.run(`DELETE FROM products WHERE product_id = ?`, [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Product deleted' });
  });
});

export default router;