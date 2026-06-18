import { requireStudent } from "@/lib/session";

export const ROLES = {
  STUDENT: "student",
  LIBRARIAN: "librarian",
  SUPER_ADMIN: "super_admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

const ROLE_HIERARCHY: Record<string, number> = {
  student: 0,
  librarian: 1,
  super_admin: 2,
};

export function roleGte(role: string, minimumRole: string): boolean {
  return (ROLE_HIERARCHY[role] ?? -1) >= (ROLE_HIERARCHY[minimumRole] ?? 0);
}

export async function requireRole(...allowedRoles: string[]) {
  const authResult = await requireStudent();

  if ("error" in authResult) {
    return authResult;
  }

  if (!allowedRoles.includes(authResult.student.role ?? "student")) {
    return {
      error: `Access denied. Required role: ${allowedRoles.join(" or ")}.` as const,
      status: 403 as const,
    };
  }

  return authResult;
}
