# Assignment 3: QR-Based Digital Library System — Intelligent Ecosystem

## Overview

This document describes all changes made for Assignment 3, building on Assignments 1 and 2. The system is now a fully intelligent digital library ecosystem with AI recommendations, role-based access control, multi-branch support, analytics dashboards, microservice-style APIs, security hardening, and backup/archival systems.

---

## 1. AI Recommendation Engine (Gemini Flash Lite)

**Files created:**
- `src/lib/services/recommendation-service.ts` — Gemini API integration + fallback logic
- `src/app/api/recommendations/route.ts` — API endpoint returning personalized recommendations
- `src/db/queries/recommendations.ts` — Student context + book catalog queries
- `src/components/BookRecommendations.tsx` — UI component embedded in dashboard

**How it works:**
1. Collects student context: borrowing history, department, semester, borrowed book categories
2. Builds a prompt for Gemini 2.0 Flash Lite with the full book catalog
3. Gemini returns top 5 book recommendations with reasoning
4. Displayed on student dashboard as "AI Recommended for You" section
5. **Fallback**: If `GEMINI_API_KEY` is not set, returns popular books by borrow count

**Setup:**
```env
GEMINI_API_KEY="your-google-ai-key"
```

---

## 2. Role-Based Access Control (RBAC)

**Files created/modified:**
- `src/lib/auth/rbac.ts` — `requireRole()` helper and role hierarchy
- `src/lib/auth/jwt.ts` — JSON Web Token sign/verify for API clients
- `src/lib/session.ts` — Updated with `requireLibrarian()` using role check
- `src/middleware.ts` — Rate limiting + security headers

**Roles:**
| Role | Permissions |
|------|-------------|
| `student` | Borrow/return books, view own history, get AI recommendations |
| `librarian` | All student + admin dashboard, fines management, analytics, logs, branches |
| `super_admin` | Full system access |

API routes check role via `requireLibrarian()` which verifies `role` column on `students` table.

---

## 3. Multi-Branch Support

**Files created:**
- `sql/migration-v3.sql` — Creates `branches` table, adds `branch_id` to students, book_copies, transactions
- `src/db/queries/branches.ts` — Branch CRUD
- `src/app/api/admin/branches/route.ts` — List/create branches
- `src/app/admin/branches/page.tsx` — Branch management UI

**Schema:**
```sql
branches (id, name, code UNIQUE, address, created_at)
```
- `students.branch_id` → home branch
- `book_copies.branch_id` → owning branch
- `transactions.branch_id` → issuing branch

---

## 4. Logging System

**Files created:**
- `sql/migration-v3.sql` — Creates `activity_logs` table
- `src/db/queries/activity-logs.ts` — Log CRUD queries
- `src/lib/services/logging-service.ts` — `logAction()` helper
- `src/app/api/admin/logs/route.ts` — Admin log viewer API
- `src/app/admin/logs/page.tsx` — Admin log viewer UI

**Logged actions:** `LOGIN`, `LOGOUT`, `BOOK_ISSUE`, `BOOK_RETURN`, `FINE_PAYMENT`, `FAILED_ATTEMPT`, `QR_SCAN`, `REGISTER`

Each log entry includes: `student_id`, `action`, `details` (JSON), `ip_address`, `created_at`.

---

## 5. Analytics Dashboard

**Files created:**
- `src/db/queries/analytics.ts` — 5 analytics aggregate queries
- `src/app/api/admin/analytics/*/route.ts` — 5 analytics endpoints
- `src/app/admin/analytics/page.tsx` — Full analytics page with Recharts

**Charts & Reports:**
| Feature | Chart Type | Description |
|---------|-----------|-------------|
| Most Popular Books | Bar chart | Top 5 books by borrow count |
| Peak Issuing Timings | Line chart | Transactions per hour of day |
| Fine Trends (6 months) | Bar chart | Monthly fine totals |
| Department Statistics | Pie chart | Borrows by department |
| Most Active Students | Table | Top 10 students by borrow count |
| Department Overview | Table | Per-dept student count, borrows, avg fine |

---

## 6. Security Hardening

| Feature | Implementation |
|---------|---------------|
| **JWT authentication** | `src/lib/auth/jwt.ts` — `signToken()` / `verifyToken()` with 7-day expiry |
| **API rate limiting** | In-memory per-IP rate limiter in `src/middleware.ts` (100 req/min) |
| **Security headers** | `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy` |
| **SQL injection prevention** | Already enforced via parameterized queries |
| **Password hashing** | Already enforced via bcryptjs (12 rounds) |
| **Activity logging** | All actions logged in `activity_logs` table |

---

## 7. Backup & Archival System

**Files created:**
- `scripts/backup.ts` — Runs `pg_dump` and saves to `./backups/`
- `scripts/archive.ts` — Marks transactions > 1 year old as `archived`
- `src/app/api/admin/backup/route.ts` — API-triggered backup (POST)

**Commands:**
```bash
npm run backup     # Creates pg_dump backup
npm run archive    # Archives old transactions
```

---

## 8. Microservice-Style API Structure

API routes are organized into domain-based groups:

```
/api/auth/           — Authentication (me, role)
/api/books/          — Book queries (my)
/api/issues/         — Circulation (scan, return, return-by-qr, fines)
/api/recommendations/— AI recommendations
/api/admin/          — Admin functions
  /dashboard         — Overview metrics
  /analytics/        — Analytics reports (5 endpoints)
  /fines/            — Fine management
  /branches/         — Branch management
  /logs/             — Activity logs
  /backup/           — Database backup
```

---

## Files Created (Assignment 3)

### SQL & Scripts
| File | Purpose |
|------|---------|
| `sql/migration-v3.sql` | Schema changes: branches, activity_logs, book_categories, new columns |
| `sql/seed-v3.sql` | Seed branches, categories, departments, popularity data |
| `scripts/migrate-v3.ts` | V3 migration runner |
| `scripts/seed-v3.ts` | V3 seed runner |
| `scripts/backup.ts` | Database backup script |
| `scripts/archive.ts` | Transaction archival script |

### DB Queries
| File | Purpose |
|------|---------|
| `src/db/queries/branches.ts` | Branch CRUD |
| `src/db/queries/activity-logs.ts` | Activity log queries |
| `src/db/queries/recommendations.ts` | Recommendation data queries |
| `src/db/queries/analytics.ts` | Analytics aggregate queries |
| `src/db/queries/fines.ts` | Fine CRUD (restored from v2) |

### Auth & Services
| File | Purpose |
|------|---------|
| `src/lib/auth/rbac.ts` | Role-based access helpers |
| `src/lib/auth/jwt.ts` | JWT sign/verify |
| `src/lib/services/logging-service.ts` | Log action helper |
| `src/lib/services/recommendation-service.ts` | Gemini AI + fallback logic |
| `src/lib/constants.ts` | Added FINE_PER_DAY, calculateFine(), Actions, RATE_LIMIT_* |

### API Routes
| File | Purpose |
|------|---------|
| `src/app/api/recommendations/route.ts` | AI book recommendations |
| `src/app/api/auth/role/route.ts` | Current user role |
| `src/app/api/admin/branches/route.ts` | Branch management |
| `src/app/api/admin/logs/route.ts` | Activity log viewer |
| `src/app/api/admin/backup/route.ts` | Trigger backup |
| `src/app/api/admin/analytics/*/route.ts` | 5 analytics endpoints |
| `src/app/api/admin/dashboard/route.ts` | Dashboard metrics (restored from v2) |
| `src/app/api/admin/fines/route.ts` | Fine management (restored from v2) |
| `src/app/api/issues/fines/route.ts` | Student fines (restored from v2) |
| `src/app/api/issues/return-by-qr/route.ts` | Return by QR (restored from v2) |

### Pages & Components
| File | Purpose |
|------|---------|
| `src/app/admin/analytics/page.tsx` | Analytics dashboard with Recharts |
| `src/app/admin/branches/page.tsx` | Branch management UI |
| `src/app/admin/logs/page.tsx` | Activity log viewer |
| `src/app/admin/dashboard/page.tsx` | Admin dashboard (restored from v2) |
| `src/components/BookRecommendations.tsx` | AI recommendation UI |
| `src/app/dashboard/page.tsx` | Updated with AI recommendations |
| `src/components/Navbar.tsx` | Updated with Analytics, Branches, Logs links |

---

## Files Modified

| File | Change |
|------|--------|
| `src/db/types.ts` | Added Fine, Branch, BookCategory, ActivityLog, BookWithCategory types; updated Student, Book, BookCopy, Transaction |
| `src/lib/constants.ts` | Added FINE_PER_DAY, calculateFine(), Actions enum, RATE_LIMIT constants |
| `src/lib/session.ts` | Added requireLibrarian() with role check |
| `src/middleware.ts` | Added rate limiting, security headers, /api route protection |
| `src/db/queries/transactions.ts` | Added getActiveTransactionByQrCode, fine calculation in returnBook |
| `src/app/actions/auth.ts` | Added logging for LOGIN, FAILED_ATTEMPT |
| `src/app/api/issues/scan/route.ts` | Added logging for BOOK_ISSUE, FAILED_ATTEMPT |
| `src/app/api/issues/return/route.ts` | Added logging for BOOK_RETURN |
| `package.json` | Added 4 new scripts, 3 new dependencies |
| `.env.example` | Added GEMINI_API_KEY, JWT_SECRET, BACKUP_DIR, RATE_LIMIT vars |

---

## Setup Instructions (Assignment 3)

Run these after completing Assignment 1+2 setup:

```bash
# Apply v3 schema changes
npm run db:migrate-v3

# Seed v3 demo data (branches, categories, departments)
npm run db:seed-v3

# Install new dependencies
npm install
```

### Environment Variables
```env
GEMINI_API_KEY="your-google-gemini-api-key"
JWT_SECRET="your-jwt-secret-change-in-production"
BACKUP_DIR="./backups"
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000
```

---

## Demo Accounts (Updated)

| University ID | Password | Role | Status |
|---------------|----------|------|--------|
| 2024F-BCS-185 | demo123 | librarian | active, CS dept, semester 4 |
| 2025F-BCNS-084 | demo123 | student | active, CS dept, semester 2 |
| 2023F-BCS-021 | demo123 | student | inactive, CS dept, semester 6 |

---

## Deliverables

| Deliverable | Location |
|-------------|----------|
| AI recommendation module | `src/lib/services/recommendation-service.ts`, `src/app/api/recommendations/`, `src/components/BookRecommendations.tsx` |
| Role management | `src/lib/auth/rbac.ts`, `src/lib/session.ts` |
| Multi-branch support | `src/db/queries/branches.ts`, `src/app/api/admin/branches/`, `src/app/admin/branches/` |
| Analytics dashboard | `src/app/admin/analytics/`, `src/db/queries/analytics.ts`, `src/app/api/admin/analytics/` |
| Microservice APIs | All `/api/*` route groups |
| Security (JWT, rate limiting, headers) | `src/lib/auth/jwt.ts`, `src/middleware.ts` |
| Activity logs | `src/db/queries/activity-logs.ts`, `src/app/api/admin/logs/`, `src/app/admin/logs/` |
| Backup & archival | `scripts/backup.ts`, `scripts/archive.ts`, `src/app/api/admin/backup/` |
| API documentation | `docs/API.md` (updated) |
| Deployment guide | `README.md` |
| Security testing report | `security-testing-report.md` (TBD) |
