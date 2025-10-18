"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthLinks() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname() ?? "/";

  async function checkSession() {
    try {
      const r = await fetch("/api/auth/session", { cache: "no-store" });
      const d = await r.json();
      setAuthed(!!d?.ok);
    } catch {
      setAuthed(false);
    }
  }

  useEffect(() => {
    checkSession();
  }, []);

  // Re-check on route changes so header updates after login/register redirects
  useEffect(() => {
    checkSession();
  }, [pathname]);

  const onLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setAuthed(false);
      router.refresh(); // update server components that depend on cookies
    }
  };

  if (authed === null) return null;

  if (!authed) {
    return (
      <div className="flex items-center gap-2">
        <a className="px-3 py-1.5 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-900"
           href={`/login?next=${encodeURIComponent(pathname)}`}>
          Sign in
        </a>
        <a className="px-3 py-1.5 rounded-md bg-brand text-white hover:opacity-90"
           href={`/register?next=${encodeURIComponent(pathname)}`}>
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
