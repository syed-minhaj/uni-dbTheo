import { NextResponse } from "next/server";
import { requireLibrarian } from "@/lib/session";
import { getFineSummary } from "@/db/queries/fines";

export async function GET() {
  const authResult = await requireLibrarian();

  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  const summary = await getFineSummary();

  return NextResponse.json({
    totalFines: parseFloat(summary?.total_fines ?? "0"),
    collected: parseFloat(summary?.collected ?? "0"),
    unpaid: parseFloat(summary?.unpaid ?? "0"),
    waived: parseFloat(summary?.waived ?? "0"),
  });
}
