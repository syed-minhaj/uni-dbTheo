import { NextResponse } from "next/server";
import { z } from "zod";
import { parseQrCode, Actions } from "@/lib/constants";
import { IssueError, issueBookByQr } from "@/lib/services/issue-service";
import { requireStudent } from "@/lib/session";
import { logAction } from "@/lib/services/logging-service";
import { headers } from "next/headers";

const scanSchema = z.object({
  qrCode: z.string().min(1),
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
  const parsed = scanSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const qrCode = parseQrCode(parsed.data.qrCode);
  const headersList = await headers();

  try {
    const result = await issueBookByQr({
      studentId: authResult.student.id,
      qrCode,
    });

    await logAction(
      authResult.student.id,
      Actions.BOOK_ISSUE,
      { transactionId: result.transactionId, qrCode, book: result.book.title },
      headersList.get("x-forwarded-for") ?? undefined
    );

    return NextResponse.json({
      message: "Book issued successfully.",
      ...result,
    });
  } catch (error) {
    if (error instanceof IssueError) {
      await logAction(
        authResult.student.id,
        Actions.FAILED_ATTEMPT,
        { qrCode, error: error.message, code: error.code },
        headersList.get("x-forwarded-for") ?? undefined
      );

      const statusMap = {
        INACTIVE: 403,
        LIMIT: 422,
        UNAVAILABLE: 409,
        NOT_FOUND: 404,
      } as const;

      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: statusMap[error.code] },
      );
    }

    console.error(error);
    return NextResponse.json(
      { error: "Failed to issue book." },
      { status: 500 },
    );
  }
}
