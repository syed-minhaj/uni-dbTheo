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
- **Gemini 3.1 Flash Lite** (AI recommendations via `@google/generative-ai`)
- **jsonwebtoken** (JWT API auth)
- **Recharts** (analytics charts)

## Features

- Login with university ID
- Camera-based QR scanning to issue and return books
- View issued books and due dates with overdue indicators
- **Auto-calculated overdue fines** (PKR 50/day)
- Return books by QR scan or transaction ID
- Unique transaction ID per issue (`TXN-{nanoid}`)
- Max 3 active borrows per student
- Same book copy cannot be issued to multiple students
- Permanent transaction history (records are never deleted)
- Only active students can borrow books
- **AI-powered book recommendations** using Google Gemini
- **Role-based access control** (student, librarian, super_admin)
- **Multi-branch library support**
- **Librarian admin dashboard** with circulation metrics, fine reports, defaulters list
- **Analytics dashboard** with Recharts (popular books, peak timings, fine trends, department stats)
- **Activity logging** for all actions (login, issue, return, fines, failed attempts)
- **Rate limiting**, JWT auth, security headers
- **Database backup** (pg_dump) and transaction archival

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

4. **Run database migrations**

```bash
npm run db:migrate
npm run db:migrate-v2
npm run db:migrate-v3
```

This creates all tables, enums, and indexes across all three assignments.

5. **Seed demo data**

```bash
npm run db:seed
npm run db:seed-v2
npm run db:seed-v3
```

This creates:
- 5 demo books with 8 total book copies
- 3 demo student accounts (1 librarian)
- QR code PNG images in `public/qr/`
- Test overdue transaction and fine record
- 2 library branches
- 5 book categories
- Student department/semester data

6. **Set environment variables**

```env
GEMINI_API_KEY="your-google-gemini-api-key"   # Optional - AI recommendations
JWT_SECRET="your-jwt-secret"                   # Optional - JWT auth
```

7. **Start the dev server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Accounts

| University ID | Password | Role | Status |
|---------------|----------|------|--------|
| 2024F-BCS-185 | demo123 | librarian | active, CS dept, semester 4 |
| 2025F-BCNS-084 | demo123 | student | active, CS dept, semester 2 |
| 2023F-BCS-021 | demo123 | student | inactive, CS dept, semester 6 |

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
│   ├── admin/
│   │   ├── analytics/       # Analytics dashboard (Recharts)
│   │   ├── branches/        # Multi-branch management
│   │   ├── dashboard/       # Librarian admin dashboard
│   │   └── logs/            # Activity log viewer
│   ├── api/
│   │   ├── admin/           # Admin API (dashboard, analytics, fines, branches, logs, backup)
│   │   ├── auth/            # Auth API (me, role)
│   │   ├── books/           # Books API (my books)
│   │   ├── issues/          # Issue/return/fines API
│   │   └── recommendations/ # AI book recommendations
│   ├── dashboard/           # Student dashboard (with AI recommendations)
│   ├── my-books/            # Borrowed books list + return + fines
│   ├── scan/                # QR camera scanner
│   └── lib/                 # Auth & DB client setup
├── components/              # UI (QrScanner, Navbar, BookList, BookRecommendations)
├── db/
│   ├── types.ts             # TypeScript interfaces
│   └── queries/             # Raw SQL query functions per entity
├── lib/
│   ├── auth/                # RBAC + JWT helpers
│   └── services/            # Issue, fine, recommendation, logging services
├── middleware.ts            # Rate limiting, security headers, route protection
sql/                         # Schema, migrations, seed data
scripts/                     # Migration, seed, backup, archive scripts
docs/                        # API documentation
public/qr/                   # Generated QR PNG files
backups/                     # Database backup dumps
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:migrate` | Run v1 schema migration |
| `npm run db:migrate-v2` | Run v2 schema changes (fines, role) |
| `npm run db:migrate-v3` | Run v3 schema changes (branches, logs, categories) |
| `npm run db:seed` | Seed v1 demo data |
| `npm run db:seed-v2` | Seed v2 demo data (librarian, test fines) |
| `npm run db:seed-v3` | Seed v3 demo data (branches, categories, depts) |
| `npm run backup` | Create pg_dump database backup |
| `npm run archive` | Archive transactions older than 1 year |

## Assignment 3 Deliverables

| Deliverable | Location |
|-------------|----------|
| AI recommendation module | `src/lib/services/recommendation-service.ts`, `src/app/api/recommendations/`, `src/components/BookRecommendations.tsx` |
| Role management (RBAC) | `src/lib/auth/rbac.ts`, `src/lib/session.ts` |
| Multi-branch support | `src/db/queries/branches.ts`, `src/app/api/admin/branches/`, `src/app/admin/branches/` |
| Analytics dashboard | `src/app/admin/analytics/`, `src/db/queries/analytics.ts` |
| Microservice-style APIs | All `/api/*` route groups |
| Security (JWT, rate limit, headers) | `src/lib/auth/jwt.ts`, `src/middleware.ts` |
| Activity logging | `src/db/queries/activity-logs.ts`, `src/app/admin/logs/` |
| Backup & archival | `scripts/backup.ts`, `scripts/archive.ts`, `src/app/api/admin/backup/` |
| API documentation | `docs/API.md` |
| Documentation | `assignment3.md` |

## License

University assignment project — SSU CS&IT Department, Spring 2026.
