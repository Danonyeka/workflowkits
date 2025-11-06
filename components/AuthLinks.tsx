
// components/AuthLinks.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthLinks() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname() ?? "/";

  async function checkSession() {
    try {
      const r = await fetch("/api/auth/session", {
        method: "GET",
        credentials: "include",   // read wk_session
        cache: "no-store",        // never serve cached JSON
        headers: { Accept: "application/json" },
      });
      const d = await r.json();
      setAuthed(!!d?.ok);
    } catch {
      setAuthed(false);
    }
  }

  // initial
  useEffect(() => {
    checkSession();
  }, []);

  // re-check on route changes
  useEffect(() => {
    checkSession();
  }, [pathname]);

  // re-check immediately when login/register/logout fires the event
  useEffect(() => {
    const onAuthChanged = () => {
      checkSession();
      router.refresh(); // ensure server comps re-read cookies
    };
    window.addEventListener("auth:changed", onAuthChanged);
    return () => window.removeEventListener("auth:changed", onAuthChanged);
  }, [router]);

  const onLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      // broadcast + refresh UI
      window.dispatchEvent(new Event("auth:changed"));
      setAuthed(false);
      router.refresh();
    }
  };

  if (authed === null) return null;

  if (!authed) {
    return (
      <div className="flex items-center gap-2">
        <a
          className="px-3 py-1.5 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-900"
          href={`/login?next=${encodeURIComponent(pathname)}`}
        >
          Sign in
        </a>
        <a
          className="px-3 py-1.5 rounded-md bg-brand text-white hover:opacity-90"
          href={`/register?next=${encodeURIComponent(pathname)}`}
        >
          Create account
        </a>
      </div>
    );
  }

  return (
    <button
      onClick={onLogout}
      className="px-3 py-1.5 rounded-md bg-red-500 text-white hover:bg-red-600"
    >
      Logout
    </button>
  );
}
