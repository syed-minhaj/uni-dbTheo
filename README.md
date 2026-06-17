# QR-Based Digital Library System

Sir Syed University (SSU) Computer Science & IT Department digital library assignment. Students request and receive books on demand by scanning QR codes. The system verifies availability, student eligibility, and issues books digitally without manual intervention. Each scan generates a unique transaction ID.

## Tech Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS 4)
- **PostgreSQL** via `pg` (raw SQL queries)
- **bcryptjs** (password hashing)
- **html5-qrcode** (camera QR scanning)
- **qrcode** (QR PNG generation)
- **nanoid** (transaction ID generation)
- **zod** (request validation)

## Features

- Login with university ID
- Camera-based QR scanning to issue and return books
- View issued books and due dates with overdue indicators
- Auto-calculated overdue fines (PKR 50/day)
- Return books by QR scan
- Unique transaction ID per issue (`TXN-{nanoid}`)
- Max 3 active borrows per student
- Same book copy cannot be issued to multiple students
- Permanent transaction history (records are never deleted)
- Only active students can borrow books
- Librarian admin dashboard with circulation metrics, fine reports, defaulters list
- Overdue warnings and fine notifications

## Prerequisites

- Node.js 20+
- PostgreSQL 14+ (local or cloud, e.g., Neon)

## Setup

1. **Clone / open the project**

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment**

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/library"
```

Or for a cloud PostgreSQL (e.g., Neon):

```env
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
```

4. **Run database migration**

```bash
npm run db:migrate
npm run db:migrate-v2
```

This creates all tables, enums, indexes, and the Assignment 2 schema (fines table, librarian role column).

5. **Seed demo data**

```bash
npm run db:seed
npm run db:seed-v2
```

This creates:
- 5 demo books with 8 total book copies
- 3 demo student accounts (one librarian)
- QR code PNG images in `public/qr/`
- Test overdue transaction and fine record

6. **Start the dev server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Accounts

| University ID | Password | Role | Status |
|---------------|----------|------|--------|
| 2024F-BCS-185 | demo123 | librarian | active |
| 2025F-BCNS-084 | demo123 | student | active |
| 2023F-BCS-021 | demo123 | student | inactive |

Student ID format: `{year}{F|S}-{program}-{roll}` (e.g. `2024F-BCS-185`, `2025F-BCNS-084`).

## Testing QR Flow

1. Sign in as `2024F-BCS-185` / `demo123`
2. Open **Scan QR** (`/scan`) on a device with a camera
3. Scan a QR image from `public/qr/` (open the PNG on another screen or print it)
4. Confirm the transaction ID and due date appear
5. View borrowed books on **My Books** (`/my-books`)
6. Use the **Return** button or scan the QR again to return via `/api/issues/return-by-qr`

For local webcam testing, use `localhost`. Phone camera access on another device may require HTTPS (deploy to Vercel or use a tunnel like ngrok).

## QR Code Format

Each book copy QR encodes:

```
LIB:COPY:BC-2024-001-A
```

The `LIB:COPY:` prefix is stripped by the server before the database lookup.

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login, register pages
│   ├── actions/             # Server actions (signin, signup, signout)
│   ├── admin/dashboard/     # Librarian admin dashboard
│   ├── api/
│   │   ├── admin/           # Librarian API (dashboard metrics, fines, reports)
│   │   ├── auth/            # Auth API (me, role)
│   │   ├── books/           # Books API (my books)
│   │   └── issues/          # Issue/return/fines API
│   ├── dashboard/           # Student dashboard
│   ├── my-books/            # Borrowed books list + return + fines
│   ├── scan/                # QR camera scanner
│   └── lib/                 # Auth & DB client setup
├── components/              # UI components (QrScanner, Navbar, BookList)
├── db/
│   ├── types.ts             # TypeScript interfaces
│   └── queries/             # Raw SQL query functions per entity
├── lib/                     # Constants, session helpers
├── middleware.ts            # Route protection
sql/                         # Schema, migration-v2, seed data
scripts/                     # Migration & seed scripts
docs/                        # API documentation
public/qr/                   # Generated QR PNG files
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:migrate` | Run Assignment 1 schema migration |
| `npm run db:migrate-v2` | Run Assignment 2 schema changes (fines, role) |
| `npm run db:seed` | Seed Assignment 1 demo data |
| `npm run db:seed-v2` | Seed Assignment 2 demo data (librarian, test fines) |

## Assignment 2 Deliverables

| Deliverable | Location |
|-------------|----------|
| Return module | `src/app/api/issues/return-by-qr/`, `src/app/api/issues/return/` |
| Fine system | `src/db/queries/fines.ts`, `src/lib/services/fine-service.ts`, `sql/migration-v2.sql` |
| Notification engine | `src/app/dashboard/page.tsx` (overdue warning), `src/components/BookList.tsx` (fine column) |
| Admin dashboard | `src/app/admin/dashboard/page.tsx` |
| Reporting system | `src/app/api/admin/` (dashboard, most-borrowed, defaulters, daily transactions, fine summary) |
| Documentation | `assignment2.md` |

## License

University assignment project — SSU CS&IT Department, Spring 2026.
