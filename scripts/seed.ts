import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { bookCopies, books, students, user } from "../src/db/schema";
import { auth } from "../src/lib/auth";
import { formatQrPayload, toUniversityEmail } from "../src/lib/constants";

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
  const existing = await db
    .select({ id: students.id })
    .from(students)
    .where(eq(students.universityId, student.universityId))
    .limit(1);

  if (existing.length > 0) {
    console.log(`Student ${student.universityId} already exists, skipping.`);
    return;
  }

  const signUpResult = await auth.api.signUpEmail({
    body: {
      email,
      password: student.password,
      name: student.fullName,
    },
  });

  if (!signUpResult?.user) {
    throw new Error(`Failed to create user for ${student.universityId}`);
  }

  await db.insert(students).values({
    userId: signUpResult.user.id,
    universityId: student.universityId,
    fullName: student.fullName,
    status: student.status,
  });

  await db
    .update(user)
    .set({ universityId: student.universityId })
    .where(eq(user.id, signUpResult.user.id));

  console.log(
    `Created student ${student.universityId} (${student.status}) password: ${student.password}`,
  );
}

async function ensureBooksAndQrCodes() {
  const qrDir = path.join(process.cwd(), "public", "qr");
  await mkdir(qrDir, { recursive: true });

  for (const book of demoBooks) {
    const existingBook = await db
      .select({ id: books.id })
      .from(books)
      .where(eq(books.isbn, book.isbn))
      .limit(1);

    let bookId = existingBook[0]?.id;

    if (!bookId) {
      const [inserted] = await db
        .insert(books)
        .values({
          title: book.title,
          author: book.author,
          isbn: book.isbn,
        })
        .returning({ id: books.id });

      bookId = inserted.id;
      console.log(`Created book: ${book.title}`);
    }

    for (const qrCode of book.copies) {
      const existingCopy = await db
        .select({ id: bookCopies.id })
        .from(bookCopies)
        .where(eq(bookCopies.qrCode, qrCode))
        .limit(1);

      if (existingCopy.length > 0) {
        continue;
      }

      await db.insert(bookCopies).values({
        bookId,
        qrCode,
        status: "available",
      });

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
  });
