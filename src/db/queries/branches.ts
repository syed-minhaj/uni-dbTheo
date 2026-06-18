import { query } from "@/app/lib/db";
import type { Branch } from "@/db/types";

export async function getAllBranches() {
  const { rows } = await query<Branch>(
    `SELECT * FROM branches ORDER BY name`
  );
  return rows;
}

export async function getBranchById(id: string) {
  const { rows } = await query<Branch>(
    `SELECT * FROM branches WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function createBranch(name: string, code: string, address?: string) {
  await query(
    `INSERT INTO branches (name, code, address) VALUES ($1, $2, $3)`,
    [name, code, address ?? null]
  );
}
