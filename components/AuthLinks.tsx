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
      const r = await fetch(`/api/auth/session?ts=${Date.now()}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          Pragma: "no-cache",
          "Cache-Control": "no-cache",
        },
      });
      const d = await r.json();
      setAuthed(!!d?.ok);
    } catch {
      setAuthed(false);
    }
  }

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    checkSession();
  }, [pathname]);

  // Re-check when tab becomes visible (handles some racey cases after nav)
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") checkSession();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // BroadcastChannel + storage ping (in case other pages/tabs log in/out)
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("wk_auth");
      bc.onmessage = () => {
        checkSession();
        router.refresh();
      };
    } catch {}

    const onStorage = (e: StorageEvent) => {
      if (e.key === "wk_auth_ping") {
        checkSession();
        router.refresh();
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
      try { bc?.close(); } catch {}
    };
  }, [router]);

  const onLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      try { new BroadcastChannel("wk_auth").postMessage("changed"); } catch {}
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
