// components/AuthLinks.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthLinks() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const pollRef = useRef<number | null>(null);

  async function checkSession() {
    try {
      const r = await fetch("/api/auth/session", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      const d = await r.json();
      setAuthed(!!d?.ok);
    } catch {
      setAuthed(false);
    }
  }

  // Initial + on route change
  useEffect(() => {
    checkSession();
  }, []);
  useEffect(() => {
    checkSession();
  }, [pathname]);

  // Listen for broadcast messages from login/register/logout
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("wk_auth");
      bc.onmessage = () => {
        checkSession();
        router.refresh();
      };
    } catch {
      // older browsers: ignore
    }

    // Also listen to localStorage ping
    const onStorage = (e: StorageEvent) => {
      if (e.key === "wk_auth_ping") {
        checkSession();
        router.refresh();
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
      try {
        bc?.close();
      } catch {}
    };
  }, [router]);

  // Short micro-poll right after we detect a “pending” flag (set by login/register)
  useEffect(() => {
    const shouldPoll = sessionStorage.getItem("wk_auth_pending") === "1";
    if (!shouldPoll) return;

    let ticks = 0;
    pollRef.current = window.setInterval(() => {
      ticks += 1;
      checkSession();
      if (ticks >= 6) {
        // stop after ~3s
        sessionStorage.removeItem("wk_auth_pending");
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }, 500);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, []);

  const onLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      // signal everywhere
      try {
        new BroadcastChannel("wk_auth").postMessage("changed");
      } catch {}
      localStorage.setItem("wk_auth_ping", String(Date.now()));
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
