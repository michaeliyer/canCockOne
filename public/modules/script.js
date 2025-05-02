console.log("📦 Script.js is loading...");

import { loadCustomers, setupCustomerForm } from "./customers.js";
import { loadProducts, setupProductForm } from "./products.js";
import { loadVariants } from "./variants.js";
import { loadOrders, setupOrderForm } from "./orders.js";
import { setupReports } from "./reports.js";
import { initUtils } from "./utils.js";

console.log("✅ All modules imported successfully");

// Track initialization state
let isInitialized = false;

// Initialize the application
async function initializeApp() {
  if (isInitialized) {
    console.log("⚠️ App already initialized, skipping...");
    return;
  }

  console.log("🚀 DOM Content Loaded: Starting initialization");
  try {
    console.log("🔄 Initializing app components...");

    // Initialize utils first
    console.log("⚙️ Initializing utils...");
    await initUtils();
    console.log("✅ Utils initialized");

    // Load and display customers
    console.log("👥 Loading customers...");
    try {
      await loadCustomers();
      console.log("✅ Customers loaded successfully");
    } catch (error) {
      console.error("❌ Error loading customers:", error);
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
    }

    console.log("📝 Setting up customer form...");
    try {
      setupCustomerForm();
      console.log("✅ Customer form setup complete");
    } catch (error) {
      console.error("❌ Error setting up customer form:", error);
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
    }

    // Load and setup products
    console.log("📦 Loading products...");
    try {
      await loadProducts();
      console.log("✅ Products loaded");
    } catch (error) {
      console.error("❌ Error loading products:", error);
    }

    console.log("📝 Setting up product form...");
    try {
      setupProductForm();
      console.log("✅ Product form setup complete");
    } catch (error) {
      console.error("❌ Error setting up product form:", error);
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
    }

    // Load other components
    console.log("🔄 Loading variants...");
    try {
      await loadVariants();
      console.log("✅ Variants loaded");
    } catch (error) {
      console.error("❌ Error loading variants:", error);
    }

    console.log("📋 Loading orders...");
    try {
      await loadOrders();
      console.log("✅ Orders loaded");
    } catch (error) {
      console.error("❌ Error loading orders:", error);
    }

    console.log("📝 Setting up order form...");
    try {
      setupOrderForm();
      console.log("✅ Order form setup complete");
    } catch (error) {
      console.error("❌ Error setting up order form:", error);
    }

    console.log("📊 Setting up reports...");
    try {
      setupReports();
      console.log("✅ Reports setup complete");
    } catch (error) {
      console.error("❌ Error setting up reports:", error);
    }

    isInitialized = true;
    console.log("✅ App initialization complete");
  } catch (error) {
    console.error("❌ Error during app initialization:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);
  }
}

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", initializeApp);

// Add error handler for uncaught errors
window.addEventListener("error", (event) => {
  console.error("❌ Uncaught error:", event.error);
  console.error("Error details:", event.error.message);
  console.error("Error stack:", event.error.stack);
});
