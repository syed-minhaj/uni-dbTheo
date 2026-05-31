import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const studentStatusEnum = pgEnum("student_status", [
  "active",
  "inactive",
]);

export const copyStatusEnum = pgEnum("copy_status", [
  "available",
  "issued",
  "lost",
]);

export const transactionStatusEnum = pgEnum("transaction_status", [
  "active",
  "returned",
]);

export const students = pgTable(
  "students",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    universityId: text("university_id").notNull().unique(),
    fullName: text("full_name").notNull(),
    status: studentStatusEnum("status").notNull().default("active"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("students_status_idx").on(table.status)],
);

export const books = pgTable("books", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  isbn: text("isbn").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookCopies = pgTable(
  "book_copies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    qrCode: text("qr_code").notNull().unique(),
    status: copyStatusEnum("status").notNull().default("available"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("book_copies_status_idx").on(table.status)],
);

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    transactionId: text("transaction_id").notNull().unique(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id),
    bookCopyId: uuid("book_copy_id")
      .notNull()
      .references(() => bookCopies.id),
    issuedAt: timestamp("issued_at").defaultNow().notNull(),
    dueDate: timestamp("due_date").notNull(),
    returnedAt: timestamp("returned_at"),
    status: transactionStatusEnum("status").notNull().default("active"),
  },
  (table) => [
    index("transactions_student_status_idx").on(table.studentId, table.status),
    index("transactions_copy_status_idx").on(table.bookCopyId, table.status),
  ],
);
