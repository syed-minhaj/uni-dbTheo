import { getCurrentUser } from "@/app/lib/auth";
import { getStudentByUserId } from "@/db/queries/students";

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
