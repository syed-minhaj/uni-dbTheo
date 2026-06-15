import { randomUUID } from "crypto";
import { query } from "@/app/lib/db";
import type { SessionWithUser } from "@/db/types";

export async function createSession(userId: string) {
  const id = randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
  await query(
    `INSERT INTO "session" (id, user_id, expires_at) VALUES ($1, $2, $3)`,
    [id, userId, expiresAt]
  );
  return { id, expiresAt };
}

export async function getSessionById(sessionId: string) {
  const { rows } = await query<SessionWithUser>(
    `SELECT s.*, u.email, u.name, u.image
     FROM "session" s
     INNER JOIN "user" u ON s.user_id = u.id
     WHERE s.id = $1 AND s.expires_at > now()
     LIMIT 1`,
    [sessionId]
  );
  return rows[0] ?? null;
}

export async function deleteSession(sessionId: string) {
  await query(`DELETE FROM "session" WHERE id = $1`, [sessionId]);
}

export async function deleteUserSessions(userId: string) {
  await query(`DELETE FROM "session" WHERE user_id = $1`, [userId]);
}

export async function cleanExpiredSessions() {
  await query(`DELETE FROM "session" WHERE expires_at < now()`);
}
