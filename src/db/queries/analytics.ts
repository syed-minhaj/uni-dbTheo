import { query } from "@/app/lib/db";

export async function getMostActiveStudents(limit = 10) {
  const { rows } = await query(
    `SELECT s.id, s.university_id, s.full_name, s.department, s.semester,
            COUNT(t.id)::text AS borrow_count
     FROM students s
     INNER JOIN transactions t ON s.id = t.student_id
     GROUP BY s.id, s.university_id, s.full_name, s.department, s.semester
     ORDER BY COUNT(t.id) DESC LIMIT $1`,
    [limit]
  );
  return rows.map((r) => ({ ...r, borrow_count: parseInt(r.borrow_count) }));
}

export async function getPopularBooks(limit = 10) {
  const { rows } = await query(
    `SELECT b.id, b.title, b.author, b.isbn, b.borrow_count,
            COALESCE(bc.name, 'General') AS category_name
     FROM books b
     LEFT JOIN book_categories bc ON b.category_id = bc.id
     ORDER BY b.borrow_count DESC LIMIT $1`,
    [limit]
  );
  return rows;
}

export async function getPeakIssuingTimings() {
  const { rows } = await query(
    `SELECT EXTRACT(HOUR FROM issued_at)::text AS hour,
            COUNT(*)::text AS count
     FROM transactions
     GROUP BY EXTRACT(HOUR FROM issued_at)
     ORDER BY hour`
  );
  return rows.map((r) => ({ hour: parseInt(r.hour), count: parseInt(r.count) }));
}

export async function getFineTrends(months = 6) {
  const { rows } = await query(
    `SELECT DATE_TRUNC('month', created_at)::date AS month,
            COUNT(*)::text AS fine_count,
            COALESCE(SUM(fine_amount), 0)::text AS total_amount
     FROM fines
     WHERE created_at >= CURRENT_DATE - ($1 || ' months')::INTERVAL
     GROUP BY DATE_TRUNC('month', created_at)
     ORDER BY month`,
    [months]
  );
  return rows.map((r) => ({
    month: r.month,
    fine_count: parseInt(r.fine_count),
    total_amount: parseFloat(r.total_amount),
  }));
}

export async function getDepartmentStatistics() {
  const { rows } = await query(
    `SELECT s.department,
            COUNT(DISTINCT s.id)::text AS student_count,
            COUNT(t.id)::text AS total_borrows,
            COALESCE(AVG(f.fine_amount), 0)::text AS avg_fine
     FROM students s
     LEFT JOIN transactions t ON s.id = t.student_id
     LEFT JOIN fines f ON t.transaction_id = f.transaction_id
     WHERE s.department IS NOT NULL
     GROUP BY s.department
     ORDER BY COUNT(t.id) DESC`
  );
  return rows.map((r) => ({
    department: r.department,
    student_count: parseInt(r.student_count),
    total_borrows: parseInt(r.total_borrows),
    avg_fine: parseFloat(r.avg_fine),
  }));
}
