"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { Navbar } from "@/components/Navbar";

const QrScanner = dynamic(
  () => import("@/components/QrScanner").then((mod) => mod.QrScanner),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[320px] items-center justify-center rounded border border-dashed border-navy-200 bg-white text-sm text-muted">
        Initializing camera...
      </div>
    ),
  },
);

type IssueResult = {
  transactionId: string;
  dueDate: string;
  book: {
    title: string;
    author: string;
    isbn: string;
  };
};

export default function ScanPage() {
  const [result, setResult] = useState<IssueResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [paused, setPaused] = useState(false);

  const handleScan = useCallback(async (decodedText: string) => {
    if (processing) {
      return;
    }

    setProcessing(true);
    setPaused(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/issues/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode: decodedText }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Failed to issue book.");
        setPaused(false);
        return;
      }

      setResult(data);
    } catch {
      setError("Network error while issuing book.");
      setPaused(false);
    } finally {
      setProcessing(false);
    }
  }, [processing]);

  function resetScanner() {
    setResult(null);
    setError(null);
    setPaused(false);
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-navy-950">Scan Book QR Code</h1>
          <p className="mt-1 text-sm text-muted">
            Scan a library QR sticker to issue a book digitally.
          </p>
        </div>

        <div className="rounded border border-navy-200 bg-white p-4">
          <QrScanner onScan={handleScan} paused={paused || processing} />
        </div>

        {processing ? (
          <p className="mt-3 text-sm text-muted">Processing issue request...</p>
        ) : null}

        {error ? (
          <div className="mt-4 rounded border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">{error}</p>
            <button
              type="button"
              onClick={resetScanner}
              className="mt-3 rounded bg-red-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-800"
            >
              Try Again
            </button>
          </div>
        ) : null}

        {result ? (
          <div className="mt-4 rounded border border-navy-200 bg-navy-50 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-navy-700">
              Book issued successfully
            </p>
            <h2 className="mt-2 text-lg font-semibold text-navy-950">{result.book.title}</h2>
            <p className="text-sm text-muted">{result.book.author}</p>
            <dl className="mt-4 space-y-2 border-t border-navy-200 pt-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Transaction ID</dt>
                <dd className="font-mono text-navy-800">{result.transactionId}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Due Date</dt>
                <dd className="text-navy-900">
                  {new Date(result.dueDate).toLocaleDateString()}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">ISBN</dt>
                <dd className="text-navy-900">{result.book.isbn}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={resetScanner}
              className="mt-4 rounded bg-navy-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-navy-900"
            >
              Scan Another Book
            </button>
          </div>
        ) : null}
      </main>
    </>
  );
}
