"use client";

import { useCallback, useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";

type DashboardData = {
  totalIssued: number;
  overdueBooks: number;
  activeBorrowers: number;
  activeInventory: number;
  dailyTransactions: { date: string; count: number }[];
};

type MostBorrowedBook = {
  id: string;
  title: string;
  author: string;
  isbn: string;
  borrow_count: number;
};

type Defaulter = {
  id: string;
  university_id: string;
  full_name: string;
  overdue_count: number;
  total_fine: number;
};

type FineSummary = {
  totalFines: number;
  collected: number;
  unpaid: number;
  waived: number;
};

type DailyTransaction = {
  date: string;
  total: number;
  activeCount: number;
  returnedCount: number;
};

type FineRecord = {
  id: string;
  transaction_id: string;
  student_id: string;
  days_overdue: number;
  fine_amount: string;
  status: string;
  created_at: string;
  university_id: string;
  student_name: string;
  book_title: string;
};

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [mostBorrowed, setMostBorrowed] = useState<MostBorrowedBook[]>([]);
  const [defaulters, setDefaulters] = useState<Defaulter[]>([]);
  const [fineSummary, setFineSummary] = useState<FineSummary | null>(null);
  const [dailyTransactions, setDailyTransactions] = useState<DailyTransaction[]>([]);
  const [allFines, setAllFines] = useState<FineRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "fines" | "transactions">("overview");

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [dashRes, booksRes, defRes, fineSumRes, dailyRes, finesRes] = await Promise.all([
        fetch("/api/admin/dashboard"),
        fetch("/api/admin/books/most-borrowed"),
        fetch("/api/admin/students/defaulters"),
        fetch("/api/admin/fines/summary"),
        fetch("/api/admin/transactions/daily"),
        fetch("/api/admin/fines"),
      ]);

      if (!dashRes.ok) {
        const data = await dashRes.json();
        setError(data.error ?? "Access denied.");
        return;
      }

      setDashboard(await dashRes.json());
      setMostBorrowed(await booksRes.json());
      setDefaulters(await defRes.json());
      setFineSummary(await fineSumRes.json());
      setDailyTransactions(await dailyRes.json());
      setAllFines(await finesRes.json());
    } catch {
      setError("Network error loading admin data.");
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function markPaid(fineId: string) {
    try {
      await fetch("/api/admin/fines", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fineId }),
      });
      loadData();
    } catch {
      setError("Failed to update fine.");
    }
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-5xl flex-1 px-4 py-8">
          <div className="rounded border border-red-200 bg-red-50 p-5">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl flex-1 px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-navy-950">Librarian Dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            Monitor all circulation activities, fines, and reports.
          </p>
        </div>

        <div className="mb-4 flex gap-1">
          {(["overview", "fines", "transactions"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded px-4 py-2 text-sm font-medium transition ${
                activeTab === tab
                  ? "bg-navy-800 text-white"
                  : "border border-navy-200 bg-white text-navy-800 hover:bg-navy-50"
              }`}
            >
              {tab === "overview" ? "Overview" : tab === "fines" ? "Fines" : "Transactions"}
            </button>
          ))}
        </div>

        {activeTab === "overview" && dashboard ? (
          <>
            <div className="mb-6 grid gap-3 md:grid-cols-5">
              <MetricCard label="Total Issued" value={dashboard.totalIssued} />
              <MetricCard label="Overdue Books" value={dashboard.overdueBooks} color="red" />
              <MetricCard label="Active Borrowers" value={dashboard.activeBorrowers} />
              <MetricCard label="Available Copies" value={dashboard.activeInventory} />
              <MetricCard label="Today" value={dashboard.dailyTransactions[0]?.count ?? 0} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <section className="rounded border border-navy-200 bg-white p-5">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-navy-800">
                  Most Borrowed Books
                </h2>
                {mostBorrowed.length === 0 ? (
                  <p className="text-sm text-muted">No data yet.</p>
                ) : (
                  <div className="space-y-2">
                    {mostBorrowed.map((book, i) => (
                      <div key={book.id} className="flex items-center justify-between border-b border-navy-100 pb-2 text-sm">
                        <div>
                          <span className="font-medium text-navy-800">{i + 1}.</span>{" "}
                          <span className="text-navy-950">{book.title}</span>
                          <span className="text-muted"> by {book.author}</span>
                        </div>
                        <span className="font-mono text-xs text-navy-700">{book.borrow_count} times</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded border border-navy-200 bg-white p-5">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-navy-800">
                  Defaulters List
                </h2>
                {defaulters.length === 0 ? (
                  <p className="text-sm text-muted">No defaulters.</p>
                ) : (
                  <div className="space-y-2">
                    {defaulters.map((d) => (
                      <div key={d.id} className="flex items-center justify-between border-b border-navy-100 pb-2 text-sm">
                        <div>
                          <span className="font-medium text-navy-950">{d.full_name}</span>
                          <span className="text-muted"> ({d.university_id})</span>
                        </div>
                        <div className="text-right text-xs">
                          <p className="text-red-600">{d.overdue_count} overdue</p>
                          <p className="font-mono text-navy-700">PKR {d.total_fine}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {fineSummary ? (
                <section className="rounded border border-navy-200 bg-white p-5">
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-navy-800">
                    Fine Collection Summary
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    <FineStat label="Total Fines" value={`PKR ${fineSummary.totalFines}`} />
                    <FineStat label="Collected" value={`PKR ${fineSummary.collected}`} color="green" />
                    <FineStat label="Unpaid" value={`PKR ${fineSummary.unpaid}`} color="red" />
                    <FineStat label="Waived" value={`PKR ${fineSummary.waived}`} color="muted" />
                  </div>
                </section>
              ) : null}
            </div>
          </>
        ) : null}

        {activeTab === "fines" && allFines.length > 0 ? (
          <div className="overflow-hidden rounded border border-navy-200 bg-white">
            <table className="min-w-full divide-y divide-navy-100 text-sm">
              <thead className="bg-navy-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted">Student</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted">Book</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted">Days Overdue</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted">Amount</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted">Status</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {allFines.map((fine) => (
                  <tr key={fine.id} className="hover:bg-navy-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy-950">{fine.student_name}</p>
                      <p className="text-muted">{fine.university_id}</p>
                    </td>
                    <td className="px-4 py-3 text-navy-900">{fine.book_title}</td>
                    <td className="px-4 py-3 text-navy-900">{fine.days_overdue}</td>
                    <td className="px-4 py-3 font-mono text-navy-800">PKR {parseFloat(fine.fine_amount).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                        fine.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : fine.status === "waived"
                          ? "bg-gray-100 text-gray-600"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {fine.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {fine.status === "unpaid" ? (
                        <button
                          type="button"
                          onClick={() => markPaid(fine.id)}
                          className="rounded bg-navy-800 px-2.5 py-1 text-xs font-medium text-white hover:bg-navy-900"
                        >
                          Mark Paid
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === "fines" ? (
          <p className="text-sm text-muted">No fines recorded.</p>
        ) : null}

        {activeTab === "transactions" && dailyTransactions.length > 0 ? (
          <div className="overflow-hidden rounded border border-navy-200 bg-white">
            <table className="min-w-full divide-y divide-navy-100 text-sm">
              <thead className="bg-navy-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted">Date</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted">Total</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted">Active</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted">Returned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {dailyTransactions.map((t) => (
                  <tr key={t.date} className="hover:bg-navy-50/50">
                    <td className="px-4 py-3 text-navy-900">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-medium text-navy-950">{t.total}</td>
                    <td className="px-4 py-3 text-navy-700">{t.activeCount}</td>
                    <td className="px-4 py-3 text-navy-700">{t.returnedCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === "transactions" ? (
          <p className="text-sm text-muted">No transactions in the last 30 days.</p>
        ) : null}
      </main>
    </>
  );
}

function MetricCard({ label, value, color = "navy" }: { label: string; value: number; color?: string }) {
  const colorClasses: Record<string, string> = {
    navy: "text-navy-950",
    red: "text-red-600",
  };

  return (
    <div className="rounded border border-navy-200 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${colorClasses[color] ?? colorClasses.navy}`}>
        {value}
      </p>
    </div>
  );
}

function FineStat({ label, value, color = "navy" }: { label: string; value: string; color?: string }) {
  const colorClasses: Record<string, string> = {
    navy: "text-navy-950",
    green: "text-green-700",
    red: "text-red-700",
    muted: "text-muted",
  };

  return (
    <div className="rounded border border-navy-100 bg-navy-50 px-3 py-2">
      <p className="text-xs text-muted">{label}</p>
      <p className={`text-base font-semibold ${colorClasses[color] ?? colorClasses.navy}`}>{value}</p>
    </div>
  );
}
