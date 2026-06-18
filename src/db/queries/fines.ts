import { query } from "@/app/lib/db";
import type { Fine } from "@/db/types";

export async function createFine(
  transactionId: string,
  studentId: string,
  daysOverdue: number,
  fineAmount: number
) {
  await query(
    `INSERT INTO fines (transaction_id, student_id, days_overdue, fine_amount)
     VALUES ($1, $2, $3, $4)`,
    [transactionId, studentId, daysOverdue, fineAmount]
  );
}

export async function getStudentFines(studentId: string) {
  const { rows } = await query(
    `SELECT f.*, t.transaction_id, b.title AS book_title
     FROM fines f
     INNER JOIN transactions t ON f.transaction_id = t.transaction_id
     INNER JOIN book_copies bc ON t.book_copy_id = bc.id
     INNER JOIN books b ON bc.book_id = b.id
     WHERE f.student_id = $1
     ORDER BY f.created_at DESC`,
    [studentId]
  );
  return rows;
}

export async function getStudentUnpaidFineTotal(studentId: string) {
  const { rows } = await query<{ total: string }>(
    `SELECT COALESCE(SUM(fine_amount), 0)::text AS total
     FROM fines WHERE student_id = $1 AND status = 'unpaid'`,
    [studentId]
  );
  return parseFloat(rows[0]?.total ?? "0");
}

export async function getAllFines(limit = 50, offset = 0) {
  const { rows } = await query(
    `SELECT f.*, s.university_id, s.full_name AS student_name, b.title AS book_title
     FROM fines f
     INNER JOIN students s ON f.student_id = s.id
     INNER JOIN transactions t ON f.transaction_id = t.transaction_id
     INNER JOIN book_copies bc ON t.book_copy_id = bc.id
     INNER JOIN books b ON bc.book_id = b.id
     ORDER BY f.created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return rows;
}

export async function getFineSummary() {
  const { rows } = await query<{
    total_fines: string;
    collected: string;
    unpaid: string;
    waived: string;
  }>(
    `SELECT
       COALESCE(SUM(fine_amount), 0)::text AS total_fines,
       COALESCE(SUM(fine_amount) FILTER (WHERE status = 'paid'), 0)::text AS collected,
       COALESCE(SUM(fine_amount) FILTER (WHERE status = 'unpaid'), 0)::text AS unpaid,
       COALESCE(SUM(fine_amount) FILTER (WHERE status = 'waived'), 0)::text AS waived
     FROM fines`,
    []
  );
  return rows[0];
}

export async function payFine(fineId: string) {
  await query(
    `UPDATE fines SET status = 'paid', paid_at = NOW() WHERE id = $1`,
    [fineId]
  );
}
