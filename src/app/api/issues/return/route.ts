import { NextResponse } from "next/server";
import { z } from "zod";
import { ReturnError, returnBook } from "@/lib/services/issue-service";
import { requireStudent } from "@/lib/session";
import { Actions } from "@/lib/constants";
import { logAction } from "@/lib/services/logging-service";
import { headers } from "next/headers";

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
  const parsed = returnSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const headersList = await headers();

  try {
    const result = await returnBook({
      studentId: authResult.student.id,
      transactionId: parsed.data.transactionId,
    });

    await logAction(
      authResult.student.id,
      Actions.BOOK_RETURN,
      { transactionId: parsed.data.transactionId, fine: result.fine },
      headersList.get("x-forwarded-for") ?? undefined
    );

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
