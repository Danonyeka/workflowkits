"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AuthLinks() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => setAuthed(!!d.ok))
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) return null; // avoid flicker

  if (!authed) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <Link className="hover:text-brand" href="/login">Sign in</Link>
        <span className="text-gray-300">|</span>
        <Link className="hover:text-brand" href="/register">Register</Link>
      </div>
    );
  }

  return (
    <button
      className="text-sm hover:text-brand"
      onClick={async () => {
        setLoggingOut(true);
        await fetch("/api/auth/logout", { method: "POST" });
        // simple refresh to update UI everywhere
        window.location.reload();
      }}
      disabled={loggingOut}
    >
      {loggingOut ? "Signing out…" : "Logout"}
    </button>
  );
}
