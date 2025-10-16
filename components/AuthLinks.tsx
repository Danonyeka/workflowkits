// components/AuthLinks.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Session = { ok: boolean; user?: { email?: string } };

export default function AuthLinks() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => mounted && setSession(d ?? { ok: false }))
      .catch(() => mounted && setSession({ ok: false }));
    return () => {
      mounted = false;
    };
  }, []);

  // Shared button base (rounded, bold, focus ring, small)
  const base =
    "inline-flex items-center justify-center rounded-full px-3.5 py-2 text-sm font-semibold shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

  if (!session) return null;

  // Not signed in → show Sign in + Create account
  if (!session.ok) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className={`${base} bg-white text-brand ring-1 ring-brand hover:bg-brand/5 focus-visible:ring-brand`}
          aria-label="Sign in"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className={`${base} bg-brand text-white hover:bg-brand/90 focus-visible:ring-brand`}
          aria-label="Create account"
        >
          Create account
        </Link>
      </div>
    );
  }

  // Signed in → show Logout
  return (
    <form
      action="/api/auth/logout"
      method="post"
      className="flex items-center gap-2"
    >
      <button
        type="submit"
        className={`${base} bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600`}
        aria-label="Log out"
      >
        Log out
      </button>
    </form>
  );
}
