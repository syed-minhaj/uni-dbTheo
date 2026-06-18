import { config } from "dotenv";
import { join } from "path";
import { Pool } from "pg";

config({ path: join(__dirname, "..", ".env") });

async function archive() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const result = await pool.query(
      `UPDATE transactions
       SET status = 'archived'
       WHERE status = 'returned'
         AND returned_at < NOW() - INTERVAL '1 year'
       RETURNING id`
    );

    console.log(`Archived ${result.rowCount} old transactions.`);
  } catch (err) {
    console.error("Archival failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

archive();
