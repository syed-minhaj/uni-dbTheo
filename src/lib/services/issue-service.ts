import { and, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/db";
import {
  bookCopies,
  books,
  students,
  transactions,
} from "@/db/schema";
import { addDays, BORROW_LIMIT, LOAN_DAYS } from "@/lib/constants";

export class IssueError extends Error {
  constructor(
    message: string,
    public code: "INACTIVE" | "LIMIT" | "UNAVAILABLE" | "NOT_FOUND",
  ) {
    super(message);
    this.name = "IssueError";
  }
}

export class ReturnError extends Error {
  constructor(
    message: string,
    public code: "NOT_FOUND" | "NOT_ACTIVE",
  ) {
    super(message);
    this.name = "ReturnError";
  }
}

export async function issueBookByQr({
  studentId,
  qrCode,
}: {
  studentId: string;
  qrCode: string;
}) {
  return db.transaction(async (tx) => {
    const [student] = await tx
      .select()
      .from(students)
      .where(eq(students.id, studentId))
      .limit(1);

    if (!student) {
      throw new IssueError("Student profile not found.", "NOT_FOUND");
    }

    if (student.status !== "active") {
      throw new IssueError(
        "Only active students can borrow books.",
        "INACTIVE",
      );
    }

    const activeBorrowCount = (
      await tx
        .select({ id: transactions.id })
        .from(transactions)
        .where(
          and(
            eq(transactions.studentId, studentId),
            eq(transactions.status, "active"),
          ),
        )
    ).length;

    if (activeBorrowCount >= BORROW_LIMIT) {
      throw new IssueError(
        `Borrowing limit reached. You can only borrow ${BORROW_LIMIT} books at a time.`,
        "LIMIT",
      );
    }

    const copyRows = await tx
      .select({
        copyId: bookCopies.id,
        copyStatus: bookCopies.status,
        bookId: books.id,
        title: books.title,
        author: books.author,
        isbn: books.isbn,
      })
      .from(bookCopies)
      .innerJoin(books, eq(bookCopies.bookId, books.id))
      .where(eq(bookCopies.qrCode, qrCode))
      .limit(1);

    const copy = copyRows[0];

    if (!copy) {
      throw new IssueError("Invalid QR code. Book copy not found.", "NOT_FOUND");
    }

    if (copy.copyStatus !== "available") {
      throw new IssueError(
        "This book copy is not available for issue.",
        "UNAVAILABLE",
      );
    }

    const issuedAt = new Date();
    const dueDate = addDays(issuedAt, LOAN_DAYS);
    const transactionId = `TXN-${nanoid(12)}`;

    await tx.insert(transactions).values({
      transactionId,
      studentId,
      bookCopyId: copy.copyId,
      issuedAt,
      dueDate,
      status: "active",
    });

    await tx
      .update(bookCopies)
      .set({ status: "issued" })
      .where(eq(bookCopies.id, copy.copyId));

    return {
      transactionId,
      issuedAt,
      dueDate,
      book: {
        id: copy.bookId,
        title: copy.title,
        author: copy.author,
        isbn: copy.isbn,
      },
    };
  });
}

export async function returnBook({
  studentId,
  transactionId,
}: {
  studentId: string;
  transactionId: string;
}) {
  return db.transaction(async (tx) => {
    const [record] = await tx
      .select({
        id: transactions.id,
        status: transactions.status,
        bookCopyId: transactions.bookCopyId,
        studentId: transactions.studentId,
      })
      .from(transactions)
      .where(eq(transactions.transactionId, transactionId))
      .limit(1);

    if (!record || record.studentId !== studentId) {
      throw new ReturnError("Transaction not found.", "NOT_FOUND");
    }

    if (record.status !== "active") {
      throw new ReturnError(
        "This book has already been returned.",
        "NOT_ACTIVE",
      );
    }

    const returnedAt = new Date();

    await tx
      .update(transactions)
      .set({ status: "returned", returnedAt })
      .where(eq(transactions.id, record.id));

    await tx
      .update(bookCopies)
      .set({ status: "available" })
      .where(eq(bookCopies.id, record.bookCopyId));

    return { transactionId, returnedAt };
  });
}

export async function getStudentBooks(studentId: string) {
  const rows = await db
    .select({
      transactionId: transactions.transactionId,
      issuedAt: transactions.issuedAt,
      dueDate: transactions.dueDate,
      returnedAt: transactions.returnedAt,
      status: transactions.status,
      title: books.title,
      author: books.author,
      isbn: books.isbn,
    })
    .from(transactions)
    .innerJoin(bookCopies, eq(transactions.bookCopyId, bookCopies.id))
    .innerJoin(books, eq(bookCopies.bookId, books.id))
    .where(eq(transactions.studentId, studentId))
    .orderBy(desc(transactions.issuedAt));

  const active = rows
    .filter((row) => row.status === "active")
    .map((row) => ({
      ...row,
      isOverdue: row.dueDate.getTime() < Date.now(),
    }));

  const history = rows.filter((row) => row.status === "returned");

  return { active, history, activeCount: active.length };
}
