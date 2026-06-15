"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signout } from "@/app/actions/auth";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/scan", label: "Scan QR" },
  { href: "/my-books", label: "My Books" },
];

type User = { id: string; name: string; email: string; image: string | null };

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function handleSignOut() {
    await signout();
    router.refresh();
  }

  if (loading || !user) {
    return null;
  }

  return (
    <header className="border-b border-navy-800 bg-navy-900">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-white">SSU Digital Library</p>
          <p className="text-xs text-navy-200">{user.name}</p>
        </div>

        <nav className="flex items-center gap-1">
          {links.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? "bg-navy-700 text-white"
                    : "text-navy-100 hover:bg-navy-800 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={handleSignOut}
            className="ml-1 rounded px-3 py-1.5 text-sm font-medium text-navy-200 transition hover:bg-navy-800 hover:text-white"
          >
            Sign out
          </button>
        </nav>
      </div>
    </header>
  );
}
