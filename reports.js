// GET /sales-report → Query by:
//   - ?startDate & endDate
//   - ?customer_id
//   - ?product_id
//   - ?variant_id

// GET /daily-report?date=YYYY-MM-DD → Report for that day

// reports.js
import express from 'express';
const router = express.Router();
import db from './db/db.js';

// Sales report with optional filters
router.get('/sales-report', (req, res) => {
  const { startDate, endDate, customer_id, product_id, variant_id } = req.query;

  let conditions = [];
  let params = [];

  if (startDate && endDate) {
    conditions.push(`o.date BETWEEN ? AND ?`);
    params.push(startDate, endDate);
  }

  if (customer_id) {
    conditions.push(`o.customer_id = ?`);
    params.push(customer_id);
  }

  if (product_id) {
    conditions.push(`p.product_id = ?`);
    params.push(product_id);
  }

  if (variant_id) {
    conditions.push(`v.variant_id = ?`);
    params.push(variant_id);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT o.order_id, o.date, o.total_price, o.payments, o.balance,
           c.name AS customer_name,
           p.name AS product_name,
           v.size AS variant_size,
           i.quantity, i.subtotal
    FROM orders o
    JOIN customers c ON o.customer_id = c.customer_id
    JOIN order_items i ON o.order_id = i.order_id
    JOIN products p ON i.product_id = p.product_id
    JOIN product_variants v ON i.variant_id = v.variant_id
    ${whereClause}
    ORDER BY o.date DESC
  `;

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const totals = {
      totalOrders: new Set(rows.map(r => r.order_id)).size,
      totalQuantity: rows.reduce((sum, r) => sum + r.quantity, 0),
      totalSales: rows.reduce((sum, r) => sum + r.total_price, 0),
      totalPayments: rows.reduce((sum, r) => sum + r.payments, 0),
      totalBalance: rows.reduce((sum, r) => sum + r.balance, 0),
    };

    res.json({ orders: rows, totals });
  });
});

// Daily report (by single date)
router.get('/daily-report', (req, res) => {
  const { date } = req.query;

  if (!date) return res.status(400).json({ error: 'Date is required' });

  const query = `
    SELECT o.order_id, o.date, o.total_price, o.payments, o.balance,
           c.name AS customer_name,
           p.name AS product_name,
           v.size AS variant_size,
           i.quantity, i.subtotal
    FROM orders o
    JOIN customers c ON o.customer_id = c.customer_id
    JOIN order_items i ON o.order_id = i.order_id
    JOIN products p ON i.product_id = p.product_id
    JOIN product_variants v ON i.variant_id = v.variant_id
    WHERE DATE(o.date) = DATE(?)
    ORDER BY o.date DESC
  `;

  db.all(query, [date], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const totals = {
      totalOrders: new Set(rows.map(r => r.order_id)).size,
      totalQuantity: rows.reduce((sum, r) => sum + r.quantity, 0),
      totalSales: rows.reduce((sum, r) => sum + r.total_price, 0),
      totalPayments: rows.reduce((sum, r) => sum + r.payments, 0),
      totalBalance: rows.reduce((sum, r) => sum + r.balance, 0),
    };

    res.json({ orders: rows, totals });
  });
});

export default router;