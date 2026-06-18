"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";

type LogRecord = {
  id: string;
  student_id: string | null;
  action: string;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  university_id: string | null;
  student_name: string | null;
};

export default function LogsPage() {
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/logs")
      .then((r) => {
        if (!r.ok) throw new Error("Access denied");
        return r.json();
      })
      .then(setLogs)
      .catch((e) => setError(e.message));
  }, []);

  const actionColors: Record<string, string> = {
    LOGIN: "bg-blue-100 text-blue-700",
    LOGOUT: "bg-gray-100 text-gray-700",
    BOOK_ISSUE: "bg-green-100 text-green-700",
    BOOK_RETURN: "bg-teal-100 text-teal-700",
    FINE_PAYMENT: "bg-yellow-100 text-yellow-700",
    FAILED_ATTEMPT: "bg-red-100 text-red-700",
  };

  if (error) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-6xl flex-1 px-4 py-8">
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
          <h1 className="text-2xl font-semibold text-navy-950">Activity Logs</h1>
          <p className="mt-1 text-sm text-muted">
            Every action in the system is logged for audit and security.
          </p>
        </div>

        <div className="overflow-hidden rounded border border-navy-200 bg-white">
          <table className="min-w-full divide-y divide-navy-100 text-sm">
            <thead className="bg-navy-50">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted">Timestamp</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted">Student</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted">Action</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted">Details</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-navy-50/50">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-navy-700">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-navy-950">{log.student_name ?? "Anonymous"}</p>
                    {log.university_id ? (
                      <p className="text-xs text-muted">{log.university_id}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${actionColors[log.action] ?? "bg-navy-100 text-navy-700"}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-xs text-muted">
                    {log.details ? JSON.stringify(log.details) : "\u2014"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">{log.ip_address ?? "\u2014"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
