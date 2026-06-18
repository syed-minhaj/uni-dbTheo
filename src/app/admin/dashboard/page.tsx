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

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/admin/dashboard");
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Access denied.");
        return;
      }
      setDashboard(await res.json());
    } catch {
      setError("Network error.");
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

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
            Monitor circulation, fines, and activity.
          </p>
        </div>

        {dashboard ? (
          <div className="mb-6 grid gap-3 md:grid-cols-5">
            <Metric label="Total Issued" value={dashboard.totalIssued} />
            <Metric label="Overdue Books" value={dashboard.overdueBooks} color="red" />
            <Metric label="Active Borrowers" value={dashboard.activeBorrowers} />
            <Metric label="Available Copies" value={dashboard.activeInventory} />
            <Metric label="Today" value={dashboard.dailyTransactions[0]?.count ?? 0} />
          </div>
        ) : (
          <p className="text-sm text-muted">Loading...</p>
        )}
      </main>
    </>
  );
}

function Metric({ label, value, color = "navy" }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded border border-navy-200 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${color === "red" ? "text-red-600" : "text-navy-950"}`}>{value}</p>
    </div>
  );
}
