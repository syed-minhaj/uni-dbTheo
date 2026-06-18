import { config } from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";
import { Pool } from "pg";

config({ path: join(__dirname, "..", ".env") });

async function migrateV2() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const sql = readFileSync(join(__dirname, "..", "sql", "migration-v2.sql"), "utf-8");
    await pool.query(sql);
    console.log("Migration v2 applied successfully.");
  } catch (err) {
    console.error("Migration v2 failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrateV2();
