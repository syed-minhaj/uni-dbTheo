# SSU Digital Library API

Base URL: `http://localhost:3000`

All library endpoints require an authenticated Better Auth session cookie unless noted otherwise.

## Authentication

Better Auth handles authentication under `/api/auth/*`.

### Register

`POST /api/auth/sign-up/email`

```json
{
  "email": "2024f-bcs-185@ssu.library",
  "password": "demo123",
  "name": "Ali Ahmed"
}
```

After registration, call student setup:

`POST /api/students/setup`

```json
{
  "universityId": "2024F-BCS-185",
  "fullName": "Ali Ahmed"
}
```

### Login

`POST /api/auth/sign-in/email`

```json
{
  "email": "2024f-bcs-185@ssu.library",
  "password": "demo123"
}
```

The UI accepts **University ID + password** (format `2024F-BCS-185`) and maps the ID to `{id}@ssu.library`.

---

## Issue Book by QR Scan

`POST /api/issues/scan`

**Auth:** Required

**Body:**

```json
{
  "qrCode": "LIB:COPY:BC-2024-001-A"
}
```

Plain copy codes such as `BC-2024-001-A` are also accepted.

**Success (200):**

```json
{
  "message": "Book issued successfully.",
  "transactionId": "TXN-abc123xyz456",
  "issuedAt": "2026-05-30T12:00:00.000Z",
  "dueDate": "2026-06-13T12:00:00.000Z",
  "book": {
    "id": "uuid",
    "title": "Introduction to Algorithms",
    "author": "Thomas H. Cormen",
    "isbn": "978-0262033848"
  }
}
```

**Errors:**

| Status | Code | Meaning |
|--------|------|---------|
| 401 | — | Not logged in |
| 403 | INACTIVE | Student account is inactive |
| 404 | NOT_FOUND | Invalid QR code |
| 409 | UNAVAILABLE | Copy already issued |
| 422 | LIMIT | Student already has 3 active borrows |

---

## Return Book

`POST /api/issues/return`

**Auth:** Required

**Body:**

```json
{
  "transactionId": "TXN-abc123xyz456"
}
```

**Success (200):**

```json
{
  "message": "Book returned successfully.",
  "transactionId": "TXN-abc123xyz456",
  "returnedAt": "2026-05-30T13:00:00.000Z"
}
```

**Errors:**

| Status | Code | Meaning |
|--------|------|---------|
| 401 | — | Not logged in |
| 404 | NOT_FOUND | Transaction not found |
| 409 | NOT_ACTIVE | Already returned |

Transaction rows are never deleted; returns only update `status` and `returned_at`.

---

## Get My Books

`GET /api/books/my`

**Auth:** Required

**Success (200):**

```json
{
  "active": [
    {
      "transactionId": "TXN-abc123xyz456",
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "isbn": "978-0132350884",
      "issuedAt": "2026-05-30T12:00:00.000Z",
      "dueDate": "2026-06-13T12:00:00.000Z",
      "status": "active",
      "isOverdue": false
    }
  ],
  "history": [
    {
      "transactionId": "TXN-old123456789",
      "title": "Computer Networking",
      "author": "James F. Kurose",
      "isbn": "978-0136681557",
      "issuedAt": "2026-04-01T10:00:00.000Z",
      "dueDate": "2026-04-15T10:00:00.000Z",
      "returnedAt": "2026-04-10T09:00:00.000Z",
      "status": "returned"
    }
  ],
  "activeCount": 1
}
```

---

## Business Rules Enforced

1. Only **active** students can issue books.
2. Maximum **3 active borrows** per student.
3. A book copy cannot be issued while its status is `issued`.
4. Every scan creates a unique **transaction ID**.
5. Transaction history is **permanent** (no deletes).
