import { NextResponse } from "next/server";
import { z } from "zod";
import { ReturnError, returnBook } from "@/lib/services/issue-service";
import { requireStudent } from "@/lib/session";

const returnSchema = z.object({
  transactionId: z.string().min(1),
});

export async function POST(request: Request) {
  const authResult = await requireStudent();

  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const body = await request.json();
  console.log("body", body);
  const parsed = returnSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  try {
    const result = await returnBook({
      studentId: authResult.student.id,
      transactionId: parsed.data.transactionId,
    });

    return NextResponse.json({
      message: "Book returned successfully.",
      ...result,
    });
  } catch (error) {
    if (error instanceof ReturnError) {
      const statusMap = {
        NOT_FOUND: 404,
        NOT_ACTIVE: 409,
      } as const;

      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: statusMap[error.code] },
      );
    }

    console.error(error);
    return NextResponse.json(
      { error: "Failed to return book." },
      { status: 500 },
    );
  }
}
