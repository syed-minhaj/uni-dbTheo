import { readFileSync } from "fs";
import { join } from "path";
import { Pool } from "pg";
import "dotenv/config";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const sql = readFileSync(join(process.cwd(), "sql", "schema.sql"), "utf8");
  try {
    await pool.query(sql);
    console.log("Schema applied successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
