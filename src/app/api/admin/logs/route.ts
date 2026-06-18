import { NextResponse } from "next/server";
import { requireLibrarian } from "@/lib/session";
import { getLogs } from "@/db/queries/activity-logs";

export async function GET() {
  const authResult = await requireLibrarian();
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const logs = await getLogs(200);
  return NextResponse.json(logs);
}
