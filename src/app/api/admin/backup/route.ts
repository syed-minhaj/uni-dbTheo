import { NextResponse } from "next/server";
import { requireLibrarian } from "@/lib/session";

export async function POST() {
  const authResult = await requireLibrarian();
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const { execSync } = require("child_process");
    const dbUrl = new URL(process.env.DATABASE_URL ?? "");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `backup-${timestamp}.sql`;
    const outputPath = `./backups/${filename}`;

    execSync(
      `pg_dump --dbname="${process.env.DATABASE_URL}" --file="${outputPath}" --format=plain`,
      { timeout: 30000 }
    );

    return NextResponse.json({
      message: "Backup created.",
      filename,
      path: outputPath,
    });
  } catch (err) {
    console.error("Backup failed:", err);
    return NextResponse.json(
      { error: "Backup failed. Ensure pg_dump is installed and DATABASE_URL is set." },
      { status: 500 }
    );
  }
}
