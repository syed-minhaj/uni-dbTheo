"use client";

type BookRow = {
  transactionId: string;
  title: string;
  author: string;
  isbn: string;
  issuedAt: string;
  dueDate: string;
  returnedAt?: string | null;
  status: "active" | "returned";
  isOverdue?: boolean;
};

type BookListProps = {
  active: BookRow[];
  history: BookRow[];
  onReturn?: (transactionId: string) => Promise<void>;
  returningId?: string | null;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function BookList({
  active,
  history,
  onReturn,
  returningId,
}: BookListProps) {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-navy-800">
          Currently Issued
        </h2>

        {active.length === 0 ? (
          <p className="rounded border border-dashed border-navy-200 bg-white p-5 text-sm text-muted">
            No active borrows. Scan a QR code to issue a book.
          </p>
        ) : (
          <div className="overflow-hidden rounded border border-navy-200 bg-white">
            <table className="min-w-full divide-y divide-navy-100 text-sm">
              <thead className="bg-navy-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    Book
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    Transaction
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    Due Date
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {active.map((book) => (
                  <tr key={book.transactionId} className="hover:bg-navy-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy-950">{book.title}</p>
                      <p className="text-muted">{book.author}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-navy-700">
                      {book.transactionId}
                    </td>
                    <td
                      className={`px-4 py-3 ${
                        book.isOverdue ? "font-semibold text-red-600" : "text-navy-900"
                      }`}
                    >
                      {formatDate(book.dueDate)}
                      {book.isOverdue ? " (Overdue)" : ""}
                    </td>
                    <td className="px-4 py-3">
                      {onReturn ? (
                        <button
                          type="button"
                          disabled={returningId === book.transactionId}
                          onClick={() => onReturn(book.transactionId)}
                          className="rounded bg-navy-800 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-navy-900 disabled:opacity-50"
                        >
                          {returningId === book.transactionId
                            ? "Returning..."
                            : "Return"}
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-navy-800">
          Issue History
        </h2>

        {history.length === 0 ? (
          <p className="text-sm text-muted">No past transactions yet.</p>
        ) : (
          <div className="overflow-hidden rounded border border-navy-200 bg-white">
            <table className="min-w-full divide-y divide-navy-100 text-sm">
              <thead className="bg-navy-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    Book
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    Transaction
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    Issued
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    Returned
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {history.map((book) => (
                  <tr key={book.transactionId} className="hover:bg-navy-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy-950">{book.title}</p>
                      <p className="text-muted">{book.author}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-navy-700">
                      {book.transactionId}
                    </td>
                    <td className="px-4 py-3 text-navy-900">{formatDate(book.issuedAt)}</td>
                    <td className="px-4 py-3 text-navy-900">
                      {book.returnedAt ? formatDate(book.returnedAt) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
