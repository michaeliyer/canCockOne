// db/db.js
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import { fileURLToPath } from "url";
import { createTables } from "./schema.js";

// Handle __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use the correct path for your database
const dbPath = path.join(__dirname, "canCockOne.db");
console.log("Initializing database at:", dbPath);

let dbInstance = null;

const initDB = async () => {
  if (dbInstance) {
    console.log("Returning existing database instance");
    return dbInstance;
  }

  console.log("Opening database connection...");
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Enable foreign keys
  console.log("Enabling foreign keys...");
  await db.exec("PRAGMA foreign_keys = ON");

  // Create tables
  console.log("Creating tables...");
  await createTables(db);

  dbInstance = db;
  console.log("Database initialization complete");
  return db;
};

export default initDB;
