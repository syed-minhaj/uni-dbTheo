import { query, pool } from "@/app/lib/db";
import type { Transaction, ActiveBookRow, IssueResult } from "@/db/types";
import { addDays, BORROW_LIMIT, LOAN_DAYS } from "@/lib/constants";

export class IssueError extends Error {
  constructor(
    message: string,
    public code: "INACTIVE" | "LIMIT" | "UNAVAILABLE" | "NOT_FOUND"
  ) {
    super(message);
    this.name = "IssueError";
  }
}

export class ReturnError extends Error {
  constructor(
    message: string,
    public code: "NOT_FOUND" | "NOT_ACTIVE"
  ) {
    super(message);
    this.name = "ReturnError";
  }
}

export async function getActiveBorrowCount(studentId: string) {
  const { rows } = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM transactions WHERE student_id = $1 AND status = 'active'`,
    [studentId]
  );
  return parseInt(rows[0]?.count ?? "0", 10);
}

export async function getTransactionByTransactionId(transactionId: string) {
  const { rows } = await query<Transaction>(
    `SELECT * FROM transactions WHERE transaction_id = $1 LIMIT 1`,
    [transactionId]
  );
  return rows[0] ?? null;
}

function toCamelCase(row: ActiveBookRow) {
  return {
    transactionId: row.transaction_id,
    issuedAt: row.issued_at,
    dueDate: row.due_date,
    returnedAt: row.returned_at,
    status: row.status,
    title: row.title,
    author: row.author,
    isbn: row.isbn,
  };
}

export async function getStudentBooks(studentId: string) {
  const { rows } = await query<ActiveBookRow>(
    `SELECT t.transaction_id, t.issued_at, t.due_date, t.returned_at, t.status,
            b.title, b.author, b.isbn
     FROM transactions t
     INNER JOIN book_copies bc ON t.book_copy_id = bc.id
     INNER JOIN books b ON bc.book_id = b.id
     WHERE t.student_id = $1
     ORDER BY t.issued_at DESC`,
    [studentId]
  );

  const mapped = rows.map(toCamelCase);

  const active = mapped
    .filter((row) => row.status === "active")
    .map((row) => ({
      ...row,
      isOverdue: new Date(row.dueDate).getTime() < Date.now(),
    }));

  const history = mapped.filter((row) => row.status === "returned");

  return { active, history, activeCount: active.length };
}

export async function issueBookByQr({
  studentId,
  qrCode,
}: {
  studentId: string;
  qrCode: string;
}) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const studentResult = await client.query(
      `SELECT id, status FROM students WHERE id = $1 LIMIT 1`,
      [studentId]
    );

    const student = studentResult.rows[0];
    if (!student) {
      throw new IssueError("Student profile not found.", "NOT_FOUND");
    }

    if (student.status !== "active") {
      throw new IssueError(
        "Only active students can borrow books.",
        "INACTIVE"
      );
    }

    const countResult = await client.query(
      `SELECT COUNT(*)::text AS count FROM transactions WHERE student_id = $1 AND status = 'active'`,
      [studentId]
    );

    if (parseInt(countResult.rows[0]?.count ?? "0", 10) >= BORROW_LIMIT) {
      throw new IssueError(
        `Borrowing limit reached. You can only borrow ${BORROW_LIMIT} books at a time.`,
        "LIMIT"
      );
    }

    const copyResult = await client.query(
      `SELECT bc.id AS copy_id, bc.status AS copy_status, b.id AS book_id, b.title, b.author, b.isbn
       FROM book_copies bc
       INNER JOIN books b ON bc.book_id = b.id
       WHERE bc.qr_code = $1 LIMIT 1`,
      [qrCode]
    );

    const copy = copyResult.rows[0];
    if (!copy) {
      throw new IssueError("Invalid QR code. Book copy not found.", "NOT_FOUND");
    }

    if (copy.copy_status !== "available") {
      throw new IssueError(
        "This book copy is not available for issue.",
        "UNAVAILABLE"
      );
    }

    const issuedAt = new Date();
    const dueDate = addDays(issuedAt, LOAN_DAYS);
    const transactionId = `TXN-${require("nanoid").nanoid(12)}`;

    await client.query(
      `INSERT INTO transactions (transaction_id, student_id, book_copy_id, issued_at, due_date, status)
       VALUES ($1, $2, $3, $4, $5, 'active')`,
      [transactionId, studentId, copy.copy_id, issuedAt, dueDate]
    );

    await client.query(
      `UPDATE book_copies SET status = 'issued' WHERE id = $1`,
      [copy.copy_id]
    );

    await client.query("COMMIT");

    return {
      transactionId,
      issuedAt,
      dueDate,
      book: {
        id: copy.book_id,
        title: copy.title,
        author: copy.author,
        isbn: copy.isbn,
      },
    } satisfies IssueResult;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function returnBook({
  studentId,
  transactionId,
}: {
  studentId: string;
  transactionId: string;
}) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const txnResult = await client.query(
      `SELECT id, status, book_copy_id, student_id FROM transactions WHERE transaction_id = $1 LIMIT 1`,
      [transactionId]
    );

    const record = txnResult.rows[0];
    if (!record || record.student_id !== studentId) {
      throw new ReturnError("Transaction not found.", "NOT_FOUND");
    }

    if (record.status !== "active") {
      throw new ReturnError(
        "This book has already been returned.",
        "NOT_ACTIVE"
      );
    }

    const returnedAt = new Date();

    await client.query(
      `UPDATE transactions SET status = 'returned', returned_at = $1 WHERE id = $2`,
      [returnedAt, record.id]
    );

    await client.query(
      `UPDATE book_copies SET status = 'available' WHERE id = $1`,
      [record.book_copy_id]
    );

    await client.query("COMMIT");

    return { transactionId, returnedAt };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
