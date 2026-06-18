export const BORROW_LIMIT = 3;
export const LOAN_DAYS = 14;

/** e.g. 2024F-BCS-185, 2025F-BCNS-084 */
export const STUDENT_ID_PATTERN = /^20\d{2}[FS]-[A-Z]{2,6}-\d{2,3}$/i;

export function normalizeStudentId(universityId: string): string {
  return universityId.trim().toUpperCase();
}

export function isValidStudentId(universityId: string): boolean {
  return STUDENT_ID_PATTERN.test(normalizeStudentId(universityId));
}

export function toUniversityEmail(universityId: string): string {
  return `${normalizeStudentId(universityId).toLowerCase()}@ssu.library`;
}

export function parseQrCode(raw: string): string {
  const trimmed = raw.trim();
  const prefix = "LIB:COPY:";

  if (trimmed.startsWith(prefix)) {
    return trimmed.slice(prefix.length);
  }

  return trimmed;
}

export function formatQrPayload(qrCode: string): string {
  return `LIB:COPY:${qrCode}`;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export const FINE_PER_DAY = 50;
export const RATE_LIMIT_MAX = 100;
export const RATE_LIMIT_WINDOW_MS = 60000;

export function isOverdue(dueDate: Date): boolean {
  return dueDate.getTime() < Date.now();
}

export function calculateFine(dueDate: Date, returnedAt: Date): { daysOverdue: number; fineAmount: number } {
  const due = new Date(dueDate);
  const returned = new Date(returnedAt);
  const diffMs = returned.getTime() - due.getTime();
  if (diffMs <= 0) return { daysOverdue: 0, fineAmount: 0 };
  const daysOverdue = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return { daysOverdue, fineAmount: daysOverdue * FINE_PER_DAY };
}

export const Actions = {
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  BOOK_ISSUE: "BOOK_ISSUE",
  BOOK_RETURN: "BOOK_RETURN",
  FINE_PAYMENT: "FINE_PAYMENT",
  FAILED_ATTEMPT: "FAILED_ATTEMPT",
  QR_SCAN: "QR_SCAN",
  REGISTER: "REGISTER",
} as const;
