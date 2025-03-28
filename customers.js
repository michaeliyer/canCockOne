// POST /customers → Add new customer
// GET /customers → Get all customers
// (Future: PUT /customers/:id, DELETE /customers/:id)

// customers.js
import express from "express";
import initDB from "./db/db.js";

const router = express.Router();

// GET all customers
router.get("/", async (req, res) => {
  console.log("GET /customers - Fetching all customers");
  try {
    const db = await initDB();
    console.log("Database connected, executing query");
    const customers = await db.all("SELECT * FROM customers ORDER BY name");
    console.log("Query executed, found customers:", customers);
    res.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST new customer
router.post("/", async (req, res) => {
  console.log("POST /customers - Adding new customer");
  console.log("Request body:", req.body);
  console.log("Request headers:", req.headers);

  const { name, email, phone, notes } = req.body;

  if (!name) {
    console.log("Validation failed: Customer name required");
    return res.status(400).json({ error: "Customer name required." });
  }

  try {
    const db = await initDB();
    console.log("Database connected, executing insert");
    console.log("Inserting customer with data:", { name, email, phone, notes });

    const result = await db.run(
      "INSERT INTO customers (name, email, phone, notes) VALUES (?, ?, ?, ?)",
      [name, email, phone, notes]
    );

    console.log("Insert successful, result:", result);
    console.log("Last inserted ID:", result.lastID);

    // Verify the insert by fetching the new customer
    const newCustomer = await db.get("SELECT * FROM customers WHERE id = ?", [
      result.lastID,
    ]);
    console.log("Verified new customer:", newCustomer);

    res.status(201).json({
      message: "Customer added!",
      customer_id: result.lastID,
      customer: newCustomer,
    });
  } catch (err) {
    console.error("Error adding customer:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
