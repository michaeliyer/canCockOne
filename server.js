  // server.js
  import express from "express";
  import cors from "cors";
  import path from "path";
  import { fileURLToPath } from "url";
  import initDB from "./db/db.js";

  // Import routers (make sure these files exist)
  import customersRouter from "./customers.js";
  import productsRouter from "./products.js";
  import variantsRouter from "./variants.js";
  import ordersRouter from "./orders.js";
  import reportsRouter from "./reports.js";

  // Initialize Express app
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Resolve __dirname for ES Modules
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // === MIDDLEWARE ===
  app.use(cors());
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "public"))); // Serve frontend from /public

  // === ROUTES ===
  app.use("/customers", customersRouter);
  app.use("/products", productsRouter);
  app.use("/variants", variantsRouter);
  app.use("/orders", ordersRouter);
  app.use("/reports", reportsRouter);

  // === TEST ROOT ROUTE ===
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
  });

  // === START SERVER ===
  const startServer = async () => {
    try {
      // Initialize database
      await initDB();

      const server = app.listen(PORT, () => {
        console.log(`🚀 CanCockOne server running at http://localhost:${PORT}`);
        console.log("Database path:", path.join(__dirname, "db/canCockOne.db"));
      });

      // Handle process termination
      process.on("SIGTERM", () => {
        console.log("SIGTERM received. Closing server...");
        server.close(() => {
          console.log("Server closed");
          process.exit(0);
        });
      });

      process.on("SIGINT", () => {
        console.log("SIGINT received. Closing server...");
        server.close(() => {
          console.log("Server closed");
          process.exit(0);
        });
      });
    } catch (error) {
      console.error("Failed to start server:", error);
      process.exit(1);
    }
  };


  // ✅ Log all registered routes

  startServer();