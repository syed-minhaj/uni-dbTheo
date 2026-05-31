# QR-Based Digital Library System

Sir Syed University (SSU) Computer Science & IT department digital library assignment. Students request and receive books on demand by scanning QR codes. The system verifies availability, student eligibility, and issues books digitally without manual intervention.

## Tech Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS)
- **Better Auth** (student authentication)
- **Drizzle ORM** + **Neon PostgreSQL**
- **html5-qrcode** (camera QR scanning)

## Features

- Login with university ID
- Camera-based QR scanning to issue books
- View issued books and due dates
- Unique transaction ID per issue
- Max 3 active borrows per student
- Same book copy cannot be issued to multiple students
- Permanent transaction history (records are never deleted)
- Only active students can borrow books

## Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) PostgreSQL database

## Setup

1. **Clone / open the project**

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment**

Copy `.env.example` to `.env.local` and fill in values:

```env
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
BETTER_AUTH_SECRET="generate-with-openssl-rand-base64-32"
BETTER_AUTH_URL="http://localhost:3000"
```

4. **Push database schema**

```bash
npm run db:push
```

5. **Seed demo data**

```bash
npm run seed
```

This creates demo students, books, book copies, and QR PNG files in `public/qr/`.

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
| 2023F-BCS-021 | demo123 | inactive |

Student ID format: `{year}{F\|S}-{program}-{roll}` (e.g. `2024F-BCS-185`, `2025F-BCNS-084`).

## Testing QR Flow

1. Sign in as `2024F-BCS-185` / `demo123`
2. Open **Scan QR** (`/scan`) on a device with a camera
3. Scan a QR image from `public/qr/` (open the PNG on another screen or print it)
4. Confirm the transaction ID and due date appear
5. View borrowed books on **My Books** (`/my-books`)

For local webcam testing, use `localhost`. Phone camera access on another device may require HTTPS (deploy to Vercel or use a tunnel).

## QR Code Format

Each book copy QR encodes:

```
LIB:COPY:BC-2024-001-A
```

## Project Structure

```
src/
├── app/                 # Pages and API routes
├── components/          # UI components (QR scanner, book list, navbar)
├── db/                  # Drizzle schema and DB client
├── lib/                 # Auth, constants, issue service
sql/                     # Standalone SQL scripts for submission
docs/                    # API documentation
scripts/                 # Seed script
public/qr/               # Generated QR PNG files
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:push` | Push Drizzle schema to Neon |
| `npm run db:generate` | Generate migration files |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run seed` | Seed demo data and QR codes |

## Assignment Deliverables

| Deliverable | Location |
|-------------|----------|
| Database schema | `src/db/schema/`, `sql/01_schema.sql` |
| SQL scripts | `sql/` |
| QR issuing module | `src/app/scan/`, `src/components/QrScanner.tsx`, `src/app/api/issues/scan/` |
| Student dashboard | `src/app/dashboard/`, `src/app/my-books/` |
| API documentation | `docs/API.md` |
| README | `README.md` |

## Submission

Submit to Microsoft Teams:

1. Source files (this project)
2. `README.md`
3. Report: `Assignment3_YourName_Rollnum_Section.docx`

Use material from `docs/API.md`, SQL scripts, and screenshots of login, scan, dashboard, and error states for the report.

## License

University assignment project.
