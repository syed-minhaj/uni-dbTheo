import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/session";
import { createStudent, getStudentByUserId } from "@/db/queries/students";
import { updateUser } from "@/db/queries/users";
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
    console.log("sessionUser is null");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = setupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  console.log("parsed.data", parsed.data);

  const existing = await getStudentByUserId(sessionUser.id);

  if (existing) {
    return NextResponse.json({ message: "Student profile already exists." });
  }
  console.log("existing", existing);
  const { universityId: rawId, fullName } = parsed.data;
  const universityId = normalizeStudentId(rawId);

  await createStudent(sessionUser.id, universityId, fullName);
  await updateUser(sessionUser.id, { university_id: universityId, name: fullName });
  //await createUser(sessionUser.id, universityId, fullName);

  return NextResponse.json({ message: "Student profile created." });
}
