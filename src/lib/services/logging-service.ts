import { createLog } from "@/db/queries/activity-logs";

export async function logAction(
  studentId: string | null,
  action: string,
  details?: Record<string, unknown>,
  ipAddress?: string
) {
  try {
    await createLog(studentId, action, details, ipAddress);
  } catch (err) {
    console.error("Failed to log action:", err);
  }
}
