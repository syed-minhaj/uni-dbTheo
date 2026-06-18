import { NextResponse } from "next/server";
import { requireLibrarian } from "@/lib/session";
import { query } from "@/app/lib/db";

export async function GET() {
  const authResult = await requireLibrarian();
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { rows } = await query(
    `SELECT b.id, b.title, b.author, b.isbn, COUNT(t.id)::text AS borrow_count
     FROM books b
     INNER JOIN book_copies bc ON b.id = bc.book_id
     INNER JOIN transactions t ON bc.id = t.book_copy_id
     GROUP BY b.id, b.title, b.author, b.isbn
     ORDER BY COUNT(t.id) DESC LIMIT 10`
  );

  return NextResponse.json(rows.map((r) => ({ ...r, borrow_count: parseInt(r.borrow_count) })));
}
