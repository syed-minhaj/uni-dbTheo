"use client";

import { useEffect, useState } from "react";

type Recommendation = {
  book: {
    id: string;
    title: string;
    author: string;
    isbn: string;
    category_name: string;
    borrow_count: number;
  };
  reason: string;
};

export function BookRecommendations() {
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/recommendations")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setRecs(data.recommendations ?? []);
        }
      })
      .catch(() => setError("Could not load recommendations."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded border border-dashed border-navy-200 bg-white p-5">
        <p className="text-sm text-muted">Loading AI recommendations...</p>
      </div>
    );
  }

  if (error || recs.length === 0) {
    return null;
  }

  return (
    <section className="rounded border border-navy-200 bg-white p-5">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-navy-800">
          AI Recommended for You
        </h2>
        <span className="rounded bg-navy-100 px-1.5 py-0.5 text-[10px] font-medium text-navy-600">
          Gemini
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {recs.map((rec) => (
          <div
            key={rec.book.id}
            className="rounded border border-navy-100 bg-navy-50/50 p-3"
          >
            <p className="font-medium text-navy-950">{rec.book.title}</p>
            <p className="text-xs text-muted">{rec.book.author}</p>
            <p className="mt-1 text-xs italic text-navy-700">{rec.reason}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
