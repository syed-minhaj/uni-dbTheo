import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";
import { getStudentByUserId } from "@/db/queries/students";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ role: null });
  }

  const student = await getStudentByUserId(user.id) as { role?: string } | null;
  return NextResponse.json({ role: (student as { role?: string } | null)?.role ?? "student" });
}
