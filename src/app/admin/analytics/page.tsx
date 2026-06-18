"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";

type AnalyticsProps = {
  mostActiveStudents: Array<{ university_id: string; full_name: string; department: string; borrow_count: number }>;
  popularBooks: Array<{ title: string; author: string; category_name: string; borrow_count: number }>;
  peakTimings: Array<{ hour: number; count: number }>;
  fineTrends: Array<{ month: string; fine_count: number; total_amount: number }>;
  departmentStats: Array<{ department: string; student_count: number; total_borrows: number; avg_fine: number }>;
};

const COLORS = ["#1e3a5f", "#2a4a73", "#3d5a80", "#5a7291", "#9bb3d4"];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsProps | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [students, books, timings, trends, dept] = await Promise.all([
          fetch("/api/admin/analytics/most-active-students").then((r) => r.json()),
          fetch("/api/admin/analytics/popular-books").then((r) => r.json()),
          fetch("/api/admin/analytics/peak-timings").then((r) => r.json()),
          fetch("/api/admin/analytics/fine-trends").then((r) => r.json()),
          fetch("/api/admin/analytics/department-stats").then((r) => r.json()),
        ]);
        setData({ mostActiveStudents: students, popularBooks: books, peakTimings: timings, fineTrends: trends, departmentStats: dept });
      } catch {
        setError("Failed to load analytics.");
      }
    }
    load();
  }, []);

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
          <h1 className="text-2xl font-semibold text-navy-950">Analytics Dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            Department-wise statistics, trends, and library usage insights.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {data?.popularBooks ? (
            <section className="rounded border border-navy-200 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-navy-800">
                Most Popular Books
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.popularBooks.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#c5d4e8" />
                  <XAxis dataKey="title" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="borrow_count" fill="#1e3a5f" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </section>
          ) : null}

          {data?.peakTimings ? (
            <section className="rounded border border-navy-200 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-navy-800">
                Peak Issuing Timings
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data.peakTimings}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#c5d4e8" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} label={{ value: "Hour of Day", position: "bottom" }} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#2a4a73" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </section>
          ) : null}

          {data?.fineTrends ? (
            <section className="rounded border border-navy-200 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-navy-800">
                Fine Trends (6 Months)
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.fineTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#c5d4e8" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total_amount" fill="#b91c1c" radius={[2, 2, 0, 0]} name="Total Fine (PKR)" />
                </BarChart>
              </ResponsiveContainer>
            </section>
          ) : null}

          {data?.departmentStats ? (
            <section className="rounded border border-navy-200 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-navy-800">
                Department-wise Statistics
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.departmentStats}
                    dataKey="total_borrows"
                    nameKey="department"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ department, percent }) => `${department} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.departmentStats.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </section>
          ) : null}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {data?.mostActiveStudents ? (
            <section className="rounded border border-navy-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-navy-800">
                Most Active Students
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-navy-100">
                      <th className="px-3 py-2 text-left text-xs font-medium uppercase text-muted">Student</th>
                      <th className="px-3 py-2 text-left text-xs font-medium uppercase text-muted">Department</th>
                      <th className="px-3 py-2 text-right text-xs font-medium uppercase text-muted">Borrows</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.mostActiveStudents.slice(0, 10).map((s) => (
                      <tr key={s.university_id} className="border-b border-navy-50 hover:bg-navy-50/50">
                        <td className="px-3 py-2 font-medium text-navy-950">{s.full_name}</td>
                        <td className="px-3 py-2 text-muted">{s.department}</td>
                        <td className="px-3 py-2 text-right font-mono text-navy-800">{s.borrow_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {data?.departmentStats ? (
            <section className="rounded border border-navy-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-navy-800">
                Department Overview
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-navy-100">
                      <th className="px-3 py-2 text-left text-xs font-medium uppercase text-muted">Department</th>
                      <th className="px-3 py-2 text-right text-xs font-medium uppercase text-muted">Students</th>
                      <th className="px-3 py-2 text-right text-xs font-medium uppercase text-muted">Borrows</th>
                      <th className="px-3 py-2 text-right text-xs font-medium uppercase text-muted">Avg Fine</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.departmentStats.map((d) => (
                      <tr key={d.department} className="border-b border-navy-50 hover:bg-navy-50/50">
                        <td className="px-3 py-2 font-medium text-navy-950">{d.department}</td>
                        <td className="px-3 py-2 text-right text-navy-800">{d.student_count}</td>
                        <td className="px-3 py-2 text-right text-navy-800">{d.total_borrows}</td>
                        <td className="px-3 py-2 text-right font-mono text-navy-800">PKR {d.avg_fine.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}
        </div>
      </main>
    </>
  );
}
