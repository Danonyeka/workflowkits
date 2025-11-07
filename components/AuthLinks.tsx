// components/AuthLinks.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function AuthLinks() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const pathname = usePathname() ?? "/";

  function optimisticCookieCheck() {
    try {
      // Instant flip if the cookie is present
      if (typeof document !== "undefined" && document.cookie.includes("wk_session=")) {
        setAuthed(true);
        return true;
      }
    } catch {}
    return false;
  }

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

  // On mount: flip instantly if cookie is already there, then confirm with API
  useEffect(() => {
    const flipped = optimisticCookieCheck();
    checkSession(); // confirm
    if (!flipped && authed === null) setAuthed(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-check on route changes (helps after navigation)
  useEffect(() => {
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Tab visibility (helps after redirects)
  useEffect(() => {
    const onVis = () => document.visibilityState === "visible" && checkSession();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Cross-tab and same-tab auth change signals
  useEffect(() => {
    const onDom = () => {
      optimisticCookieCheck();
      checkSession();
    };
    window.addEventListener("wk-auth-changed", onDom as EventListener);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("wk_auth");
      bc.onmessage = () => {
        optimisticCookieCheck();
        checkSession();
      };
    } catch {}

    const onStorage = (e: StorageEvent) => {
      if (e.key === "wk_auth_ping") {
        optimisticCookieCheck();
        checkSession();
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("wk-auth-changed", onDom as EventListener);
      window.removeEventListener("storage", onStorage);
      try { bc?.close(); } catch {}
    };
  }, []);

  const onLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include", cache: "no-store" });
    } finally {
      // fire signals
      try { new BroadcastChannel("wk_auth").postMessage("changed"); } catch {}
      localStorage.setItem("wk_auth_ping", String(Date.now()));
      window.dispatchEvent(new Event("wk-auth-changed"));
      setAuthed(false);
      // hard refresh ensures everything re-renders unauthenticated
      window.location.assign("/");
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
