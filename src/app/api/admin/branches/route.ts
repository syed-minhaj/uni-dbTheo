import { NextResponse } from "next/server";
import { requireLibrarian } from "@/lib/session";
import { getAllBranches, createBranch } from "@/db/queries/branches";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  address: z.string().optional(),
});

export async function GET() {
  const authResult = await requireLibrarian();
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const branches = await getAllBranches();
  return NextResponse.json(branches);
}

export async function POST(request: Request) {
  const authResult = await requireLibrarian();
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  await createBranch(parsed.data.name, parsed.data.code, parsed.data.address);
  return NextResponse.json({ message: "Branch created." });
}
