import { NextResponse } from "next/server";
import { getStudentBooks } from "@/lib/services/issue-service";
import { requireStudent } from "@/lib/session";

export async function GET() {
  const authResult = await requireStudent();

  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const books = await getStudentBooks(authResult.student.id);

  return NextResponse.json(books);
}
