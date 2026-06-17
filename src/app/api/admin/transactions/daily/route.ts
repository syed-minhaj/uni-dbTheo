import { NextResponse } from "next/server";
import { requireLibrarian } from "@/lib/session";
import { query } from "@/app/lib/db";

export async function GET() {
  const authResult = await requireLibrarian();

  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  const { rows } = await query(
    `SELECT DATE(issued_at) AS date,
            COUNT(*)::text AS total,
            COUNT(*) FILTER (WHERE status = 'active')::text AS active_count,
            COUNT(*) FILTER (WHERE status = 'returned')::text AS returned_count
     FROM transactions
     WHERE issued_at >= CURRENT_DATE - INTERVAL '30 days'
     GROUP BY DATE(issued_at)
     ORDER BY date DESC`
  );

  return NextResponse.json(
    rows.map((r) => ({
      date: r.date,
      total: parseInt(r.total),
      activeCount: parseInt(r.active_count),
      returnedCount: parseInt(r.returned_count),
    }))
  );
}
