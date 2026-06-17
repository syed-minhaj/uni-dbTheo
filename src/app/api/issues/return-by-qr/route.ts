import { NextResponse } from "next/server";
import { z } from "zod";
import { parseQrCode } from "@/lib/constants";
import { requireStudent } from "@/lib/session";
import {
  ReturnError,
  returnBook,
  getActiveTransactionByQrCode,
} from "@/lib/services/issue-service";

const returnByQrSchema = z.object({
  qrCode: z.string().min(1),
});

export async function POST(request: Request) {
  const authResult = await requireStudent();

  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  const body = await request.json();
  const parsed = returnByQrSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const qrCode = parseQrCode(parsed.data.qrCode);

  const activeTxn = await getActiveTransactionByQrCode(authResult.student.id, qrCode);

  if (!activeTxn) {
    return NextResponse.json(
      { error: "No active transaction found for this QR code.", code: "NOT_FOUND" },
      { status: 404 }
    );
  }

  try {
    const result = await returnBook({
      studentId: authResult.student.id,
      transactionId: activeTxn.transaction_id,
    });

    return NextResponse.json({
      message: "Book returned successfully.",
      ...result,
    });
  } catch (error) {
    if (error instanceof ReturnError) {
      const statusMap = { NOT_FOUND: 404, NOT_ACTIVE: 409 } as const;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: statusMap[error.code] }
      );
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to return book." }, { status: 500 });
  }
}
