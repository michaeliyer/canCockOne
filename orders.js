// POST /orders → Create new order (handles items, totals, stock decrement)
// GET /orders → Get all orders (with customer + item details)

// orders.js
import express from 'express';
const router = express.Router();
import db from './db/db.js';

// Create a new order
router.post('/', async (req, res) => {
  const { customer_id, items, total_price, payments, balance } = req.body;
  const date = new Date().toISOString();

  try {
    await db.run('BEGIN TRANSACTION');

    // Insert order
    const orderResult = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO orders (customer_id, date, total_price, payments, balance, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [customer_id, date, total_price, payments, balance, 'open'],
        function (err) {
          if (err) return reject(err);
          resolve(this);
        }
      );
    });

    const orderId = orderResult.lastID;

    for (const item of items) {
      const { variant_id, quantity } = item;

      const variant = await new Promise((resolve, reject) => {
        db.get(
          `SELECT product_id, unit_price FROM product_variants WHERE variant_id = ?`,
          [variant_id],
          (err, row) => {
            if (err) return reject(err);
            if (!row) return reject(new Error('Variant not found'));
            resolve(row);
          }
        );
      });

      const subtotal = variant.unit_price * quantity;

      // Insert order item
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO order_items (order_id, product_id, variant_id, quantity, subtotal)
           VALUES (?, ?, ?, ?, ?)`,
          [orderId, variant.product_id, variant_id, quantity, subtotal],
          (err) => {
            if (err) return reject(err);
            resolve();
          }
        );
      });

      // Update stock
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE product_variants
           SET units_in_stock = units_in_stock - ?, units_sold = units_sold + ?
           WHERE variant_id = ?`,
          [quantity, quantity, variant_id],
          (err) => {
            if (err) return reject(err);
            resolve();
          }
        );
      });
    }

    await db.run('COMMIT');
    res.json({ message: 'Order placed successfully!' });
  } catch (err) {
    await db.run('ROLLBACK');
    console.error('Order creation failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get all orders
router.get('/', (req, res) => {
  const query = `
    SELECT o.order_id, o.date, o.total_price, o.payments, o.balance, o.status,
           c.name AS customer_name,
           p.name AS product_name,
           v.size AS variant_size,
           i.quantity, i.subtotal
    FROM orders o
    JOIN customers c ON o.customer_id = c.customer_id
    JOIN order_items i ON o.order_id = i.order_id
    JOIN products p ON i.product_id = p.product_id
    JOIN product_variants v ON i.variant_id = v.variant_id
    ORDER BY o.date DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

export default router;