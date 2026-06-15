import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import QRCode from "qrcode";
import { Pool } from "pg";
import { formatQrPayload, toUniversityEmail } from "../src/lib/constants";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const demoStudents = [
  {
    universityId: "2024F-BCS-085",
    fullName: "Ali Ahmed",
    password: "aliali1234",
    status: "active" as const,
  },
  {
    universityId: "2025F-BCNS-074",
    fullName: "Sara Khan",
    password: "sara1234",
    status: "active" as const,
  },
  {
    universityId: "2023F-BCS-021",
    fullName: "Inactive Student",
    password: "inactive123",
    status: "inactive" as const,
  },
];

const demoBooks = [
  {
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    isbn: "978-0262033848",
    copies: ["BC-2024-001-A", "BC-2024-001-B"],
  },
  {
    title: "Database System Concepts",
    author: "Abraham Silberschatz",
    isbn: "978-0078022159",
    copies: ["BC-2024-002-A"],
  },
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    isbn: "978-0132350884",
    copies: ["BC-2024-003-A", "BC-2024-003-B"],
  },
  {
    title: "Computer Networking",
    author: "James F. Kurose",
    isbn: "978-0136681557",
    copies: ["BC-2024-004-A"],
  },
  {
    title: "Artificial Intelligence: A Modern Approach",
    author: "Stuart Russell",
    isbn: "978-0134610993",
    copies: ["BC-2024-005-A", "BC-2024-005-B"],
  },
];

async function ensureStudent(student: (typeof demoStudents)[number]) {
  const email = toUniversityEmail(student.universityId);

  const existing = await pool.query(
    `SELECT id FROM students WHERE university_id = $1 LIMIT 1`,
    [student.universityId]
  );

  if (existing.rows.length > 0) {
    console.log(`Student ${student.universityId} already exists, skipping.`);
    return;
  }

  const userId = randomUUID();
  const hashedPassword = await bcrypt.hash(student.password, 12);

  await pool.query(
    `INSERT INTO "user" (id, name, email, hashed_password, university_id) VALUES ($1, $2, $3, $4, $5)`,
    [userId, student.fullName, email, hashedPassword, student.universityId]
  );

  const studentId = randomUUID();
  await pool.query(
    `INSERT INTO students (id, user_id, university_id, full_name, status) VALUES ($1, $2, $3, $4, $5)`,
    [studentId, userId, student.universityId, student.fullName, student.status]
  );

  console.log(
    `Created student ${student.universityId} (${student.status}) password: ${student.password}`
  );
}

async function ensureBooksAndQrCodes() {
  const qrDir = path.join(process.cwd(), "public", "qr");
  await mkdir(qrDir, { recursive: true });

  for (const book of demoBooks) {
    const existingBook = await pool.query(
      `SELECT id FROM books WHERE isbn = $1 LIMIT 1`,
      [book.isbn]
    );

    let bookId = existingBook.rows[0]?.id;

    if (!bookId) {
      bookId = randomUUID();
      await pool.query(
        `INSERT INTO books (id, title, author, isbn) VALUES ($1, $2, $3, $4)`,
        [bookId, book.title, book.author, book.isbn]
      );
      console.log(`Created book: ${book.title}`);
    }

    for (const qrCode of book.copies) {
      const existingCopy = await pool.query(
        `SELECT id FROM book_copies WHERE qr_code = $1 LIMIT 1`,
        [qrCode]
      );

      if (existingCopy.rows.length > 0) {
        continue;
      }

      await pool.query(
        `INSERT INTO book_copies (id, book_id, qr_code) VALUES ($1, $2, $3)`,
        [randomUUID(), bookId, qrCode]
      );

      const payload = formatQrPayload(qrCode);
      const pngPath = path.join(qrDir, `${qrCode}.png`);
      await QRCode.toFile(pngPath, payload, { width: 300, margin: 2 });
      console.log(`Created copy ${qrCode} -> ${pngPath}`);
    }
  }
}

async function main() {
  console.log("Seeding SSU Digital Library demo data...\n");

  await ensureBooksAndQrCodes();

  for (const student of demoStudents) {
    await ensureStudent(student);
  }

  console.log("\nSeed complete.");
  console.log("Demo logins:");
  for (const student of demoStudents) {
    console.log(`- ${student.universityId} / ${student.password} (${student.status})`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => pool.end());
