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

  const [
    { rows: totalIssued },
    { rows: overdueBooks },
    { rows: activeBorrowers },
    { rows: activeInventory },
    { rows: dailyTransactions },
  ] = await Promise.all([
    query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM transactions`),
    query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM transactions WHERE status = 'active' AND due_date < NOW()`),
    query<{ count: string }>(`SELECT COUNT(DISTINCT student_id)::text AS count FROM transactions WHERE status = 'active'`),
    query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM book_copies WHERE status = 'available'`),
    query<{ count: string; date: string }>(`SELECT COUNT(*)::text AS count, DATE(issued_at) AS date FROM transactions WHERE issued_at >= CURRENT_DATE GROUP BY DATE(issued_at)`),
  ]);

  return NextResponse.json({
    totalIssued: parseInt(totalIssued[0]?.count ?? "0"),
    overdueBooks: parseInt(overdueBooks[0]?.count ?? "0"),
    activeBorrowers: parseInt(activeBorrowers[0]?.count ?? "0"),
    activeInventory: parseInt(activeInventory[0]?.count ?? "0"),
    dailyTransactions: dailyTransactions.map((r) => ({ date: r.date, count: parseInt(r.count) })),
  });
}
