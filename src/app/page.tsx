import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getSessionUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-full max-w-5xl flex-1 flex-col justify-center px-4 py-16">
      <div className="rounded border border-navy-200 bg-white p-10 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-navy-600">
          Sir Syed University · CS &amp; IT
        </p>
        <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-navy-950">
          QR-Based Digital Library System
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          Request and receive books on demand by scanning QR codes. The system
          verifies availability, student eligibility, and issues books digitally
          with a unique transaction ID for every scan.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          <Link
            href="/login"
            className="rounded bg-navy-800 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-navy-900"
          >
            Student Login
          </Link>
          <Link
            href="/register"
            className="rounded border border-navy-300 bg-white px-5 py-2.5 text-sm font-medium text-navy-800 transition hover:bg-navy-50"
          >
            Register
          </Link>
        </div>

        <ul className="mt-10 grid gap-2 text-sm text-muted md:grid-cols-2">
          <li className="rounded border border-navy-100 bg-navy-50 px-3 py-2">
            Maximum 3 active borrows per student
          </li>
          <li className="rounded border border-navy-100 bg-navy-50 px-3 py-2">
            One copy cannot be issued to multiple students
          </li>
          <li className="rounded border border-navy-100 bg-navy-50 px-3 py-2">
            Permanent transaction history (never deleted)
          </li>
          <li className="rounded border border-navy-100 bg-navy-50 px-3 py-2">
            Only active students can issue books
          </li>
        </ul>
      </div>
    </main>
  );
}
