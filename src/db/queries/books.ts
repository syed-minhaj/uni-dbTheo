import { randomUUID } from "crypto";
import { query } from "@/app/lib/db";
import type { Book, BookCopy } from "@/db/types";

export async function getBookCopyByQrCode(qrCode: string) {
  const { rows } = await query<BookCopy & { book_id: string; title: string; author: string; isbn: string }>(
    `SELECT bc.id AS copy_id, bc.status AS copy_status, bc.book_id, b.title, b.author, b.isbn
     FROM book_copies bc
     INNER JOIN books b ON bc.book_id = b.id
     WHERE bc.qr_code = $1 LIMIT 1`,
    [qrCode]
  );
  return rows[0] ?? null;
}

export async function getBookByIsbn(isbn: string) {
  const { rows } = await query<Book>(
    `SELECT * FROM books WHERE isbn = $1 LIMIT 1`,
    [isbn]
  );
  return rows[0] ?? null;
}

export async function createBook(title: string, author: string, isbn: string) {
  const id = randomUUID();
  await query(
    `INSERT INTO books (id, title, author, isbn) VALUES ($1, $2, $3, $4)`,
    [id, title, author, isbn]
  );
  return id;
}

export async function createBookCopy(bookId: string, qrCode: string) {
  const id = randomUUID();
  await query(
    `INSERT INTO book_copies (id, book_id, qr_code) VALUES ($1, $2, $3)`,
    [id, bookId, qrCode]
  );
  return id;
}

export async function getBookCopyByQrCodeExists(qrCode: string) {
  const { rows } = await query<{ id: string }>(
    `SELECT id FROM book_copies WHERE qr_code = $1 LIMIT 1`,
    [qrCode]
  );
  return rows[0] ?? null;
}

export async function updateBookCopyStatus(id: string, status: "available" | "issued" | "lost") {
  await query(
    `UPDATE book_copies SET status = $1 WHERE id = $2`,
    [status, id]
  );
}
