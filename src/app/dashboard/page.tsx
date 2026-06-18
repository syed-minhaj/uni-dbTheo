import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { BookRecommendations } from "@/components/BookRecommendations";
import { BORROW_LIMIT } from "@/lib/constants";
import { getStudentBooks } from "@/lib/services/issue-service";
import { getSessionUser, getStudentForUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { query } from "@/app/lib/db";

export const dynamic = "force-dynamic";

async function getStudentFineData(studentId: string) {
  const { rows } = await query<{ total: string; count: string }>(
    `SELECT COALESCE(SUM(fine_amount), 0)::text AS total,
            COUNT(*)::text AS count
     FROM fines WHERE student_id = $1 AND status = 'unpaid'`,
    [studentId]
  );
  return {
    unpaidFineTotal: parseFloat(rows[0]?.total ?? "0"),
    unpaidFineCount: parseInt(rows[0]?.count ?? "0"),
  };
}

export default async function DashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const student = await getStudentForUser(user.id);

  if (!student) {
    redirect("/register");
  }

  const { active, activeCount } = await getStudentBooks(student.id);
  const fineData = await getStudentFineData(student.id);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl flex-1 px-4 py-8">
        <div className="mb-6 rounded border border-navy-200 bg-white px-5 py-4">
          <h1 className="text-2xl font-semibold text-navy-950">
            Welcome, {student.full_name}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Student ID:{" "}
            <span className="font-mono text-navy-800">{student.university_id}</span>
            {" · "}
            Status:{" "}
            <span
              className={
                student.status === "active"
                  ? "font-medium text-navy-700"
                  : "font-medium text-red-600"
              }
            >
              {student.status}
            </span>
          </p>
        </div>

        {fineData.unpaidFineTotal > 0 ? (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">
              Overdue Warning: You have {fineData.unpaidFineCount} unpaid fine(s)
              totalling PKR {fineData.unpaidFineTotal.toFixed(2)}.
            </p>
            <p className="mt-1 text-xs text-red-600">
              Please return overdue books to avoid further charges.
            </p>
          </div>
        ) : null}

        <div className="mb-6 grid gap-3 md:grid-cols-4">
          <div className="rounded border border-navy-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Active Borrows
            </p>
            <p className="mt-2 text-3xl font-semibold text-navy-950">
              {activeCount}
              <span className="text-lg font-normal text-muted">/{BORROW_LIMIT}</span>
            </p>
          </div>

          <div className="rounded border border-navy-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Overdue Books
            </p>
            <p className="mt-2 text-3xl font-semibold text-red-600">
              {active.filter((book) => book.isOverdue).length}
            </p>
          </div>

          <div className="rounded border border-navy-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Unpaid Fines
            </p>
            <p className="mt-2 text-3xl font-semibold text-navy-950">
              PKR {fineData.unpaidFineTotal.toFixed(0)}
            </p>
          </div>

          <div className="rounded border border-navy-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Quick Actions
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <Link
                href="/scan"
                className="rounded bg-navy-800 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-navy-900"
              >
                Scan QR Code
              </Link>
              <Link
                href="/my-books"
                className="rounded border border-navy-300 bg-white px-4 py-2 text-center text-sm font-medium text-navy-800 transition hover:bg-navy-50"
              >
                View My Books
              </Link>
            </div>
          </div>
        </div>

        <BookRecommendations />
      </main>
    </>
  );
}
