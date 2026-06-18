import { query } from "@/app/lib/db";

export async function getStudentContext(studentId: string) {
  const { rows } = await query<{
    department: string;
    semester: number;
    borrowed_titles: string;
    borrowed_categories: string;
  }>(
    `SELECT
       s.department,
       s.semester,
       COALESCE(string_agg(DISTINCT b.title, ', '), '') AS borrowed_titles,
       COALESCE(string_agg(DISTINCT bc.name, ', '), '') AS borrowed_categories
     FROM students s
     LEFT JOIN transactions t ON t.student_id = s.id
     LEFT JOIN book_copies bcp ON t.book_copy_id = bcp.id
     LEFT JOIN books b ON bcp.book_id = b.id
     LEFT JOIN book_categories bc ON b.category_id = bc.id
     WHERE s.id = $1
     GROUP BY s.department, s.semester`,
    [studentId]
  );
  return rows[0] ?? null;
}

export async function getAllBooksForRecommendation() {
  const { rows } = await query(
    `SELECT b.id, b.title, b.author, b.isbn, b.description,
            COALESCE(bc.name, 'General') AS category_name,
            b.borrow_count
     FROM books b
     LEFT JOIN book_categories bc ON b.category_id = bc.id
     ORDER BY b.borrow_count DESC`
  );
  return rows;
}

export async function getPopularBooksInDepartment(department: string, limit = 5) {
  const { rows } = await query(
    `SELECT b.id, b.title, b.author, b.isbn, bc.name AS category_name, b.borrow_count
     FROM books b
     LEFT JOIN book_categories bc ON b.category_id = bc.id
     ORDER BY b.borrow_count DESC
     LIMIT $1`,
    [limit]
  );
  return rows;
}
