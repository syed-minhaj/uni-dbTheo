# Assignment 2: QR-Based Digital Library System — Changes

## Overview

This document describes all changes made to the project for Assignment 2, building on the Assignment 1 codebase while preserving the core architecture (auth system, DB connection pattern, query structure, component patterns).

---

## New Features

### 1. Fine System

- **Auto-calculation**: When a book is returned overdue, the system automatically calculates the fine (PKR 50/day, configurable via `FINE_PER_DAY` in `src/lib/constants.ts`).
- **Fine recording**: Fines are stored in a new `fines` table with transaction ID, student ID, days overdue, amount, and status (unpaid/paid/waived).
- **Student dashboard**: Shows unpaid fine total and count with an overdue warning banner.
- **Book history**: Each returned transaction displays the associated fine amount and status in the history table.

### 2. Return via QR

- **New endpoint**: `POST /api/issues/return-by-qr` — accepts a QR code, looks up the student's active transaction for that copy, and processes the return.
- Works alongside the existing transaction-ID-based return (`POST /api/issues/return`).

### 3. Librarian Admin Dashboard

- **Role-based access**: A `role` column added to the `students` table (`student` or `librarian`). Existing auth system is reused — no separate admin login.
- **Route protection**: `requireLibrarian()` helper in `src/lib/session.ts` checks for the librarian role on admin API routes.
- **Admin dashboard** at `/admin/dashboard` with three tabs:

#### Overview Tab
- Total issued books
- Overdue books count
- Active borrowers (distinct students with active issues)
- Available copies (active inventory)
- Today's transactions count
- Most borrowed books (top 10)
- Defaulters list (students with overdue books + unpaid fines)
- Fine collection summary (total/collected/unpaid/waived)

#### Fines Tab
- Full fines table with student name, book, days overdue, amount, status
- "Mark Paid" button for librarians to update fine status

#### Transactions Tab
- Daily transaction log for the last 30 days (total, active, returned counts)

### 4. Notification Engine

- **Overdue warnings**: Dashboard displays a red warning banner when a student has unpaid fines, with the total amount.
- **Fine display**: Each returned book in My Books history shows the fine amount and status.
- The system notifies students at every login/dashboard visit about outstanding fines.

### 5. Reporting System

- **Fine summary report**: Available via `GET /api/admin/fines/summary`
- **Daily transactions report**: Available via `GET /api/admin/transactions/daily`
- **Defaulters report**: Available via `GET /api/admin/students/defaulters`
- **Most borrowed books report**: Available via `GET /api/admin/books/most-borrowed`

---

## Files Modified

| File | Change |
|------|--------|
| `src/lib/constants.ts` | Added `FINE_PER_DAY` (50) and `calculateFine()` function |
| `src/db/types.ts` | Added `Fine` type, extended `ActiveBookRow` with `fine_amount` and `fine_status` |
| `src/db/queries/transactions.ts` | Updated `returnBook()` to calculate & record fines; added `getActiveTransactionByQrCode()`, updated `getStudentBooks()` to join fines data |
| `src/lib/services/issue-service.ts` | Added `getActiveTransactionByQrCode` to re-exports |
| `src/lib/session.ts` | Added `requireLibrarian()` for admin route protection |
| `src/middleware.ts` | Added `/admin/:path*` to protected routes and matcher |
| `src/components/Navbar.tsx` | Added role detection and dynamic "Admin" link for librarians |
| `src/app/dashboard/page.tsx` | Added unpaid fines display, overdue warning banner, extended grid to 4 columns |
| `src/app/my-books/page.tsx` | Updated types to include `fineAmount` and `fineStatus` |
| `src/components/BookList.tsx` | Added "Fine" column to history table showing amount and status |
| `src/app/api/issues/return/route.ts` | Return response now includes fine data from updated `returnBook()` |
| `package.json` | Added `db:migrate-v2` and `db:seed-v2` scripts |

## Files Created

| File | Purpose |
|------|---------|
| `sql/migration-v2.sql` | Adds `role` column to students, creates `fines` table with indexes |
| `sql/seed-v2.sql` | Sets librarian role on demo user, creates overdue test data |
| `scripts/migrate-v2.ts` | Runs the v2 migration SQL |
| `scripts/seed-v2.ts` | Runs the v2 seed SQL |
| `src/db/queries/fines.ts` | CRUD queries for fines table |
| `src/lib/services/fine-service.ts` | `recordFineIfOverdue()` service function |
| `src/app/api/auth/role/route.ts` | Returns the current user's role (student/librarian) |
| `src/app/api/issues/return-by-qr/route.ts` | Return book by scanning QR code |
| `src/app/api/issues/fines/route.ts` | Returns student's fines and unpaid total |
| `src/app/api/admin/dashboard/route.ts` | Admin dashboard metrics |
| `src/app/api/admin/books/most-borrowed/route.ts` | Top 10 most borrowed books |
| `src/app/api/admin/students/defaulters/route.ts` | Students with overdue books and fines |
| `src/app/api/admin/transactions/daily/route.ts` | Daily transaction log (30 days) |
| `src/app/api/admin/fines/summary/route.ts` | Fine collection summary |
| `src/app/api/admin/fines/route.ts` | List all fines + mark as paid |
| `src/app/admin/dashboard/page.tsx` | Librarian admin dashboard UI |
| `src/app/admin/layout.tsx` | Admin layout (dynamic) |
| `assignment2.md` | This documentation file |

---

## Database Changes

### New Column

```sql
ALTER TABLE students ADD COLUMN role TEXT NOT NULL DEFAULT 'student';
```

Allowed values: `'student'` (default), `'librarian'`

### New Table: `fines`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| transaction_id | TEXT (FK → transactions) | References the transaction |
| student_id | UUID (FK → students) | Student who owes the fine |
| days_overdue | INTEGER | Number of days overdue |
| fine_amount | DECIMAL(10,2) | Calculated fine (days × rate) |
| status | ENUM ('unpaid','paid','waived') | Current fine status |
| paid_at | TIMESTAMP | When fine was paid |
| created_at | TIMESTAMP | When fine was recorded |

### Indexes

- `fines_student_status_idx` on (student_id, status)
- `fines_status_idx` on (status)

---

## API Endpoints Added

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/issues/return-by-qr` | Student | Return book by scanning QR code |
| GET | `/api/issues/fines` | Student | Get current user's fines + unpaid total |
| GET | `/api/auth/role` | Student | Get current user's role |
| GET | `/api/admin/dashboard` | Librarian | Dashboard metrics |
| GET | `/api/admin/books/most-borrowed` | Librarian | Top 10 most borrowed books |
| GET | `/api/admin/students/defaulters` | Librarian | Defaulters list |
| GET | `/api/admin/transactions/daily` | Librarian | Daily transaction log (30 days) |
| GET | `/api/admin/fines/summary` | Librarian | Fine collection summary |
| GET | `/api/admin/fines` | Librarian | List all fines with student/book details |
| PATCH | `/api/admin/fines` | Librarian | Mark a fine as paid |

---

## Setup Instructions (Assignment 2)

After completing the Assignment 1 setup, run:

```bash
# Apply v2 schema changes (adds role column + fines table)
npm run db:migrate-v2

# Seed v2 demo data (librarian role, test fines)
npm run db:seed-v2
```

---

## Demo Accounts (Updated)

| University ID | Password | Role | Status |
|---------------|----------|------|--------|
| 2024F-BCS-185 | demo123 | **librarian** | active |
| 2025F-BCNS-084 | demo123 | student | active |
| 2023F-BCS-021 | demo123 | student | inactive |

**Note:** The librarian account (`2024F-BCS-185`) now has an overdue test transaction (`TXN-OVERDUE-001`) and a returned fine record (`TXN-FINE-001`, PKR 800) pre-seeded for demonstration.

---

## Architecture Preserved

The following core architecture decisions from Assignment 1 remain unchanged:

- **Auth system**: Session cookies with bcrypt password hashing, `user` + `session` tables
- **DB pattern**: Raw SQL via `pg` pool with `query()` helper in `src/app/lib/db.ts`
- **Query structure**: Separate files per entity in `src/db/queries/`
- **Service re-export**: `src/lib/services/issue-service.ts` barrel file
- **Component patterns**: QrScanner, Navbar, BookList
- **All existing API routes**: `/api/issues/scan`, `/api/issues/return`, `/api/books/my`, `/api/auth/me`
- **Existing pages**: Login, register, scan, my-books, dashboard layouts
