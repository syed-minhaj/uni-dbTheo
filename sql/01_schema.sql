-- SSU QR-Based Digital Library System
-- Schema script for PostgreSQL (Neon)

CREATE TYPE student_status AS ENUM ('active', 'inactive');
CREATE TYPE copy_status AS ENUM ('available', 'issued', 'lost');
CREATE TYPE transaction_status AS ENUM ('active', 'returned');

-- Better Auth core tables
CREATE TABLE "user" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  image TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  university_id TEXT UNIQUE
);

CREATE TABLE "session" (
  id TEXT PRIMARY KEY,
  expires_at TIMESTAMP NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE "account" (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  access_token TEXT,
  refresh_token TEXT,
  id_token TEXT,
  access_token_expires_at TIMESTAMP,
  refresh_token_expires_at TIMESTAMP,
  scope TEXT,
  password TEXT,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE "verification" (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Library domain tables
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
  university_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  status student_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX students_status_idx ON students(status);

CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE book_copies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  qr_code TEXT NOT NULL UNIQUE,
  status copy_status NOT NULL DEFAULT 'available',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX book_copies_status_idx ON book_copies(status);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT NOT NULL UNIQUE,
  student_id UUID NOT NULL REFERENCES students(id),
  book_copy_id UUID NOT NULL REFERENCES book_copies(id),
  issued_at TIMESTAMP NOT NULL DEFAULT NOW(),
  due_date TIMESTAMP NOT NULL,
  returned_at TIMESTAMP,
  status transaction_status NOT NULL DEFAULT 'active'
);

CREATE INDEX transactions_student_status_idx ON transactions(student_id, status);
CREATE INDEX transactions_copy_status_idx ON transactions(book_copy_id, status);

-- Business rule notes:
-- 1. Max 3 active borrows enforced in application layer before insert.
-- 2. Same copy cannot be issued twice while status = 'issued'.
-- 3. Transaction rows are never deleted; returns update status and returned_at.
