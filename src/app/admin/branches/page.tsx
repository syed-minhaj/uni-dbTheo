"use client";

import { FormEvent, useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";

type Branch = {
  id: string;
  name: string;
  code: string;
  address: string | null;
};

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/branches")
      .then((r) => r.json())
      .then(setBranches)
      .catch(() => setError("Failed to load branches."));
  }, []);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      const res = await fetch("/api/admin/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, code, address }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to create branch.");
        return;
      }

      setName("");
      setCode("");
      setAddress("");
      const updated = await fetch("/api/admin/branches").then((r) => r.json());
      setBranches(updated);
    } catch {
      setError("Network error.");
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl flex-1 px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-navy-950">Library Branches</h1>
          <p className="mt-1 text-sm text-muted">Manage multi-branch library locations.</p>
        </div>

        <div className="mb-6 rounded border border-navy-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-navy-800">
            Add New Branch
          </h2>
          <form onSubmit={handleCreate} className="flex flex-wrap gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Branch name"
              className="rounded border border-navy-200 px-3 py-2 text-sm"
              required
            />
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Code (e.g., MAIN)"
              className="rounded border border-navy-200 px-3 py-2 text-sm font-mono"
              required
            />
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address"
              className="min-w-[200px] rounded border border-navy-200 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="rounded bg-navy-800 px-4 py-2 text-sm font-medium text-white hover:bg-navy-900"
            >
              Create
            </button>
          </form>
          {error ? (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          ) : null}
        </div>

        <div className="overflow-hidden rounded border border-navy-200 bg-white">
          <table className="min-w-full divide-y divide-navy-100 text-sm">
            <thead className="bg-navy-50">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted">Code</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted">Name</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted">Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {branches.map((b) => (
                <tr key={b.id} className="hover:bg-navy-50/50">
                  <td className="px-4 py-3 font-mono text-xs text-navy-700">{b.code}</td>
                  <td className="px-4 py-3 font-medium text-navy-950">{b.name}</td>
                  <td className="px-4 py-3 text-muted">{b.address ?? "\u2014"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
