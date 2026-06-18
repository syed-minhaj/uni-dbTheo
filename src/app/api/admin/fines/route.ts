import { NextResponse } from "next/server";
import { requireLibrarian } from "@/lib/session";
import { getAllFines, payFine } from "@/db/queries/fines";

export async function GET() {
  const authResult = await requireLibrarian();
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const fines = await getAllFines();
  return NextResponse.json(fines);
}

export async function PATCH(request: Request) {
  const authResult = await requireLibrarian();
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const body = await request.json();
  const { fineId } = body;
  if (!fineId) {
    return NextResponse.json({ error: "fineId is required." }, { status: 400 });
  }
  await payFine(fineId);
  return NextResponse.json({ message: "Fine marked as paid." });
}
