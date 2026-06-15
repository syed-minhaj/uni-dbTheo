"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { isValidStudentId, toUniversityEmail } from "@/lib/constants";
import { signin } from "@/app/actions/auth";

const inputClass =
  "mt-1.5 w-full rounded border border-navy-200 bg-white px-3 py-2.5 text-sm text-navy-900 placeholder:text-navy-300 focus:border-navy-600";

export default function LoginPage() {
  const router = useRouter();
  const [universityId, setUniversityId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!isValidStudentId(universityId)) {
      setLoading(false);
      setError("Invalid student ID format. Example: 2024F-BCS-185");
      return;
    }

    const result = await signin(
      toUniversityEmail(universityId),
      password
    );

    setLoading(false);

    if (result?.err) {
      setError(result.err);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-full flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded border border-navy-200 bg-white p-8 shadow-sm">
        <div className="mb-6 border-b border-navy-100 pb-4">
          <h1 className="text-xl font-semibold text-navy-950">Student Login</h1>
          <p className="mt-1 text-sm text-muted">
            Sign in with your student ID to access the digital library.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-navy-800">
            Student ID
            <input
              value={universityId}
              onChange={(event) => setUniversityId(event.target.value)}
              placeholder="2024F-BCS-185"
              className={inputClass}
              required
            />
          </label>

          <label className="block text-sm font-medium text-navy-800">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClass}
              required
            />
          </label>

          {error ? (
            <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-navy-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-navy-900 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Need an account?{" "}
          <Link href="/register" className="font-medium text-navy-800 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
