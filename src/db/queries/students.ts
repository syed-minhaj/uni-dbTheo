import { randomUUID } from "crypto";
import { query } from "@/app/lib/db";
import type { Student } from "@/db/types";

export async function getStudentByUserId(userId: string) {
  const { rows } = await query<Student>(
    `SELECT * FROM students WHERE user_id = $1 LIMIT 1`,
    [userId]
  );
  return rows[0] ?? null;
}

export async function getStudentById(id: string) {
  const { rows } = await query<Student>(
    `SELECT * FROM students WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function createStudent(
  userId: string,
  universityId: string,
  fullName: string
) {
    console.log("createStudent");
  const id = randomUUID();
  await query(
    `INSERT INTO students (id, user_id, university_id, full_name) VALUES ($1, $2, $3, $4)`,
    [id, userId, universityId, fullName]
  );
  return id;
}

export async function getStudentByUniversityId(universityId: string) {
  const { rows } = await query<Student>(
    `SELECT * FROM students WHERE university_id = $1 LIMIT 1`,
    [universityId]
  );
  return rows[0] ?? null;
}
