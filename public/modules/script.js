console.log("Script.js is loading...");

// Import all modules
import { loadCustomers, setupCustomerForm } from "./customers.js";
import { loadProducts } from "./products.js";
import { loadVariants } from "./variants.js";
import { loadOrders, setupOrderForm } from "./orders.js";
import { setupReports } from "./reports.js";
import { initUtils } from "./utils.js";

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 App Loaded: CanCockOne");
  try {
    initUtils();
    loadCustomers();
    setupCustomerForm();
    loadProducts();
    loadVariants();
    loadOrders();
    setupOrderForm(); // 🔥 Important
    setupReports();
  } catch (error) {
    console.error("Error during app initialization:", error);
  }
});
