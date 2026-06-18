import { query } from "@/app/lib/db";
import type { ActivityLog } from "@/db/types";

export async function createLog(
  studentId: string | null,
  action: string,
  details?: Record<string, unknown>,
  ipAddress?: string
) {
  await query(
    `INSERT INTO activity_logs (student_id, action, details, ip_address)
     VALUES ($1, $2, $3, $4)`,
    [studentId, action, details ? JSON.stringify(details) : null, ipAddress ?? null]
  );
}

export async function getLogs(limit = 100, offset = 0) {
  const { rows } = await query(
    `SELECT al.*, s.university_id, s.full_name AS student_name
     FROM activity_logs al
     LEFT JOIN students s ON al.student_id = s.id
     ORDER BY al.created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return rows;
}

export async function getLogsByStudent(studentId: string, limit = 50) {
  const { rows } = await query(
    `SELECT al.*, s.university_id, s.full_name AS student_name
     FROM activity_logs al
     LEFT JOIN students s ON al.student_id = s.id
     WHERE al.student_id = $1
     ORDER BY al.created_at DESC LIMIT $2`,
    [studentId, limit]
  );
  return rows;
}

export async function getRecentLogsByAction(action: string, limit = 20) {
  const { rows } = await query(
    `SELECT al.*, s.university_id, s.full_name AS student_name
     FROM activity_logs al
     LEFT JOIN students s ON al.student_id = s.id
     WHERE al.action = $1
     ORDER BY al.created_at DESC LIMIT $2`,
    [action, limit]
  );
  return rows;
}
