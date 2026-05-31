import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { students, user } from "@/db/schema";
import { getSessionUser } from "@/lib/session";
import { isValidStudentId, normalizeStudentId } from "@/lib/constants";

const setupSchema = z.object({
  universityId: z
    .string()
    .refine(isValidStudentId, "Invalid student ID format (e.g. 2024F-BCS-185)."),
  fullName: z.string().min(2),
});

export async function POST(request: Request) {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = setupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const existing = await db
    .select({ id: students.id })
    .from(students)
    .where(eq(students.userId, sessionUser.id))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({ message: "Student profile already exists." });
  }

  const { universityId: rawId, fullName } = parsed.data;
  const universityId = normalizeStudentId(rawId);

  await db.insert(students).values({
    userId: sessionUser.id,
    universityId,
    fullName,
    status: "active",
  });

  await db
    .update(user)
    .set({ universityId, name: fullName })
    .where(eq(user.id, sessionUser.id));

  return NextResponse.json({ message: "Student profile created." });
}
