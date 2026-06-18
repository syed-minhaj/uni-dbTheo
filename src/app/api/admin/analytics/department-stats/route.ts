import { NextResponse } from "next/server";
import { requireLibrarian } from "@/lib/session";
import { getDepartmentStatistics } from "@/db/queries/analytics";

export async function GET() {
  const authResult = await requireLibrarian();
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const data = await getDepartmentStatistics();
  return NextResponse.json(data);
}
