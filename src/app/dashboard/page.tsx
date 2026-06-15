import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { BORROW_LIMIT } from "@/lib/constants";
import { getStudentBooks } from "@/lib/services/issue-service";
import { getSessionUser, getStudentForUser } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

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

        <div className="grid gap-3 md:grid-cols-3">
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
      </main>
    </>
  );
}
