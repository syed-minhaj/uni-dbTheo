import { randomUUID } from "crypto";
import { query } from "@/app/lib/db";
import type { User } from "@/db/types";

export async function createUser(
  email: string,
  name: string,
  hashedPassword: string
) {
  const id = randomUUID();
  await query(
    `INSERT INTO "user" (id, name, email, hashed_password) VALUES ($1, $2, $3, $4)`,
    [id, name, email, hashedPassword]
  );
  return id;
}

export async function getUserByEmail(email: string) {
  const { rows } = await query<User>(
    `SELECT * FROM "user" WHERE email = $1 LIMIT 1`,
    [email]
  );
  return rows[0] ?? null;
}

export async function getUserById(id: string) {
  const { rows } = await query<User>(
    `SELECT * FROM "user" WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function updateUser(
  id: string,
  data: { name?: string; university_id?: string }
) {
  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (data.name !== undefined) {
    sets.push(`"name" = $${i++}`);
    values.push(data.name);
  }
  if (data.university_id !== undefined) {
    sets.push(`university_id = $${i++}`);
    values.push(data.university_id);
  }

  if (sets.length === 0) return;

  sets.push(`updated_at = now()`);
  values.push(id);

  await query(
    `UPDATE "user" SET ${sets.join(", ")} WHERE id = $${i}`,
    values
  );
}
