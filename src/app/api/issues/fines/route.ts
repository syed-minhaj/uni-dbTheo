import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/session";
import { getStudentFines, getStudentUnpaidFineTotal } from "@/db/queries/fines";

export async function GET() {
  const authResult = await requireStudent();
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const fines = await getStudentFines(authResult.student.id);
  const unpaidTotal = await getStudentUnpaidFineTotal(authResult.student.id);
  return NextResponse.json({ fines, unpaidTotal });
}
