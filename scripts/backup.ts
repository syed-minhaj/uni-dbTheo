import { config } from "dotenv";
import { join } from "path";
import { execSync } from "child_process";
import { mkdirSync, existsSync } from "fs";

config({ path: join(__dirname, "..", ".env") });

async function backup() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const backupDir = join(__dirname, "..", "backups");
  if (!existsSync(backupDir)) {
    mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `backup-${timestamp}.sql`;
  const filepath = join(backupDir, filename);

  try {
    execSync(
      `pg_dump --dbname="${dbUrl}" --file="${filepath}" --format=plain --no-owner`,
      { timeout: 60000, stdio: "pipe" }
    );
    console.log(`Backup created: ${filepath}`);
  } catch (err) {
    console.error("Backup failed:", err);
    process.exit(1);
  }
}

backup();
