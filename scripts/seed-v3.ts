import { config } from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";
import { Pool } from "pg";

config({ path: join(__dirname, "..", ".env") });

async function seedV3() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const sql = readFileSync(join(__dirname, "..", "sql", "seed-v3.sql"), "utf-8");
    await pool.query(sql);
    console.log("Seed v3 applied successfully.");
  } catch (err) {
    console.error("Seed v3 failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedV3();
