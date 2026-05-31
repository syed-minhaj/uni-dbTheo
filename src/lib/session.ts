import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { students } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function getSessionUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  return session.user;
}

export async function getStudentForUser(userId: string) {
  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.userId, userId))
    .limit(1);

  return student ?? null;
}

export async function requireStudent() {
  const user = await getSessionUser();

  if (!user) {
    return { error: "Unauthorized" as const, status: 401 };
  }

  const student = await getStudentForUser(user.id);

  if (!student) {
    return { error: "Student profile not found" as const, status: 404 };
  }

  return { user, student };
}
