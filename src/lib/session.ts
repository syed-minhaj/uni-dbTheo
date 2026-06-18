import { getCurrentUser } from "@/app/lib/auth";
import { getStudentByUserId } from "@/db/queries/students";
import type { Student } from "@/db/types";

export async function getSessionUser() {
  return getCurrentUser();
}

export async function getStudentForUser(userId: string) {
  return getStudentByUserId(userId);
}

export async function requireStudent() {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "Unauthorized" as const, status: 401 };
  }

  const student = await getStudentByUserId(user.id);

  if (!student) {
    return { error: "Student profile not found" as const, status: 404 };
  }

  return { user, student };
}

export async function requireLibrarian() {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "Unauthorized" as const, status: 401 };
  }

  const student = await getStudentByUserId(user.id) as (Student & { role?: string }) | null;

  if (!student) {
    return { error: "Student profile not found" as const, status: 404 };
  }

  if (student.role !== "librarian" && student.role !== "super_admin") {
    return { error: "Access denied. Librarian role required." as const, status: 403 };
  }

  return { user, student };
}
