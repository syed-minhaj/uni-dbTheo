"use client";

import { useCallback, useEffect, useState } from "react";
import { BookList } from "@/components/BookList";
import { Navbar } from "@/components/Navbar";

type BooksResponse = {
  active: Array<{
    transactionId: string;
    title: string;
    author: string;
    isbn: string;
    issuedAt: string;
    dueDate: string;
    status: "active";
    isOverdue: boolean;
  }>;
  history: Array<{
    transactionId: string;
    title: string;
    author: string;
    isbn: string;
    issuedAt: string;
    dueDate: string;
    returnedAt: string | null;
    status: "returned";
  }>;
};

export default function MyBooksPage() {
  const [books, setBooks] = useState<BooksResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState<string | null>(null);

  const loadBooks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/books/my");
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Failed to load books.");
        return;
      }

      setBooks(data);
    } catch {
      setError("Network error while loading books.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  async function handleReturn(transactionId: string) {
    setReturningId(transactionId);

    try {
      const response = await fetch("/api/issues/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Failed to return book.");
        return;
      }

      await loadBooks();
    } catch {
      setError("Network error while returning book.");
    } finally {
      setReturningId(null);
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl flex-1 px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-navy-950">My Books</h1>
          <p className="mt-1 text-sm text-muted">
            View issued books, due dates, and permanent transaction history.
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-muted">Loading your books...</p>
        ) : null}

        {error ? (
          <p className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {books ? (
          <BookList
            active={books.active}
            history={books.history}
            onReturn={handleReturn}
            returningId={returningId}
          />
        ) : null}
      </main>
    </>
  );
}
