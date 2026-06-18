import { NextResponse } from "next/server";
import { requireLibrarian } from "@/lib/session";
import { query } from "@/app/lib/db";

export async function GET() {
  const authResult = await requireLibrarian();
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { rows } = await query(
    `SELECT s.id, s.university_id, s.full_name,
            COUNT(t.id)::text AS overdue_count,
            COALESCE(SUM(f.fine_amount) FILTER (WHERE f.status = 'unpaid'), 0)::text AS total_fine
     FROM students s
     INNER JOIN transactions t ON s.id = t.student_id
     LEFT JOIN fines f ON t.transaction_id = f.transaction_id
     WHERE t.status = 'active' AND t.due_date < NOW()
     GROUP BY s.id, s.university_id, s.full_name
     ORDER BY total_fine DESC LIMIT 20`
  );

  return NextResponse.json(rows.map((r) => ({
    ...r,
    overdue_count: parseInt(r.overdue_count),
    total_fine: parseFloat(r.total_fine),
  })));
}
