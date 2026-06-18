"use server";
import bcrypt from "bcryptjs";
import { createUser, getUserByEmail } from "@/db/queries/users";
import { createStudent } from "@/db/queries/students";
import { setSessionCookie, clearSessionCookie } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { normalizeStudentId, isValidStudentId, toUniversityEmail, Actions } from "@/lib/constants";
import { logAction } from "@/lib/services/logging-service";
import { headers } from "next/headers";

export async function signup(universityId: string, fullName: string, password: string) {
  if (!isValidStudentId(universityId)) {
    return { err: "Invalid student ID format. Example: 2024F-BCS-185" };
  }

  const normalizedId = normalizeStudentId(universityId);
  const email = toUniversityEmail(normalizedId);

  const existing = await getUserByEmail(email);
  if (existing) return { err: "Email already in use" };

  const hashedPassword = await bcrypt.hash(password, 12);
  const userId = await createUser(email, fullName, hashedPassword);
  await createStudent(userId, normalizedId, fullName);
  await setSessionCookie(userId);
  redirect("/dashboard");
}

export async function signin(email: string, password: string) {
  const user = await getUserByEmail(email);
  if (!user || !user.hashed_password) {
    const headersList = await headers();
    await logAction(null, Actions.FAILED_ATTEMPT, { email, reason: "User not found" }, headersList.get("x-forwarded-for") ?? undefined);
    return { err: "Invalid credentials" };
  }

  const valid = await bcrypt.compare(password, user.hashed_password);
  if (!valid) {
    const headersList = await headers();
    await logAction(null, Actions.FAILED_ATTEMPT, { email, reason: "Invalid password" }, headersList.get("x-forwarded-for") ?? undefined);
    return { err: "Invalid credentials" };
  }

  await setSessionCookie(user.id);
  redirect("/dashboard");
}

export async function signout() {
  await clearSessionCookie();
  redirect("/login");
}
