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
- Camera-based QR scanning to issue books
- View issued books and due dates with overdue indicators
- Return books to make copies available again
- Unique transaction ID per issue (`TXN-{nanoid}`)
- Max 3 active borrows per student
- Same book copy cannot be issued to multiple students
- Permanent transaction history (records are never deleted)
- Only active students can borrow books
- Responsive dashboard with borrowing stats

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
```

This creates all tables, enums, and indexes defined in `sql/schema.sql`.

5. **Seed demo data**

```bash
npm run db:seed
```

This creates:
- 5 demo books with 8 total book copies
- 3 demo student accounts
- QR code PNG images in `public/qr/`

6. **Start the dev server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Accounts

| University ID | Password | Status |
|---------------|----------|--------|
| 2024F-BCS-185 | demo123 | active |
| 2025F-BCNS-084 | demo123 | active |
| 2023F-BCS-021 | demo123 | inactive (blocked) |

Student ID format: `{year}{F|S}-{program}-{roll}` (e.g. `2024F-BCS-185`, `2025F-BCNS-084`).

## Testing QR Flow

1. Sign in as `2024F-BCS-185` / `demo123`
2. Open **Scan QR** (`/scan`) on a device with a camera
3. Scan a QR image from `public/qr/` (open the PNG on another screen or print it)
4. Confirm the transaction ID and due date appear
5. View borrowed books on **My Books** (`/my-books`)
6. Use the **Return** button to mark a book as returned

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
├── app/                     # Pages, API routes, server actions
│   ├── (auth)/              # Login, register pages
│   ├── api/                 # Route handlers (issues/scan, issues/return, books/my)
│   ├── actions/             # Server actions (signin, signup, signout)
│   ├── dashboard/           # Student dashboard (server component)
│   ├── my-books/            # Borrowed books list + return
│   ├── scan/                # QR camera scanner
│   └── lib/                 # Auth & DB client setup
├── components/              # UI components (QrScanner, Navbar, BookList)
├── db/
│   ├── types.ts             # TypeScript interfaces
│   └── queries/             # Raw SQL query functions per entity
├── lib/                     # Constants, session helpers
├── middleware.ts            # Route protection
sql/                         # Schema, seed data, constraints demo
scripts/                     # Migration & seed scripts, report generator
docs/                        # API documentation
public/qr/                   # Generated QR PNG files
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:migrate` | Run database schema migration |
| `npm run db:seed` | Seed demo data and generate QR codes |

## Assignment Deliverables

| Deliverable | Location |
|-------------|----------|
| Database schema | `sql/schema.sql` |
| SQL scripts | `sql/` (schema, seed, constraints demo) |
| QR issuing module | `src/app/api/issues/scan/`, `src/components/QrScanner.tsx`, `src/lib/services/` |
| Student dashboard | `src/app/dashboard/`, `src/app/my-books/` |
| API documentation | `docs/API.md` |
| Report | `DATABASE LAB REPORT - QR Library - MB.docx` |
| README | `README.md` |

## Submission

Submit to Microsoft Teams:

1. Source files (this project)
2. `README.md`
3. Report: `Assignment3_YourName_Rollnum_Section.docx`


## License

University assignment project — SSU CS&IT Department, Spring 2026.
