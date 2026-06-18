import { calculateFine } from "@/lib/constants";
import { createFine } from "@/db/queries/fines";
import { getTransactionByTransactionId } from "@/db/queries/transactions";

export async function recordFineIfOverdue(
  transactionId: string,
  studentId: string,
  returnedAt: Date
) {
  const txn = await getTransactionByTransactionId(transactionId);
  if (!txn) return null;

  const { daysOverdue, fineAmount } = calculateFine(txn.due_date, returnedAt);
  if (daysOverdue <= 0) return null;

  await createFine(transactionId, studentId, daysOverdue, fineAmount);
  return { daysOverdue, fineAmount };
}
