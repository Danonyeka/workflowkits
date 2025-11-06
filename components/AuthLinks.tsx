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
        credentials: "include",      // ← send wk_session cookie
        cache: "no-store",           // ← avoid stale CDN/browser
        headers: { Accept: "application/json" },
      });
      const d = await r.json();
      setAuthed(!!d?.ok);
    } catch {
      setAuthed(false);
    }
  }

  // initial + route changes
  useEffect(() => { checkSession(); }, [pathname]);

  // react immediately to login/logout without full reload
  useEffect(() => {
    const onChanged = () => checkSession();
    window.addEventListener("auth:changed", onChanged);

    // also re-check when tab becomes visible (returning from /login)
    const onVis = () => { if (document.visibilityState === "visible") checkSession(); };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      window.removeEventListener("auth:changed", onChanged);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const onLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
      });
    } finally {
      // tell listeners, refresh server comps, and reflect immediately
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
