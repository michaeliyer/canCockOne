// utils.js
export async function initUtils() {
  console.log("⚙️ Initializing utilities...");
  try {
    // Add any utility functions here
    console.log("✅ Utilities initialized successfully");
    return true;
  } catch (error) {
    console.error("❌ Error initializing utilities:", error);
    throw error;
  }
}
