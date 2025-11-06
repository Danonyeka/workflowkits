// components/Header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

/** ---- tiny client hook for live session (no cache) ---- */
type Session = { ok: boolean; user: { id: string; email: string } | null };

function useSession() {
  const [session, setSession] = useState<Session>({ ok: false, user: null });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/auth/session", {
      credentials: "include",
      cache: "no-store",
      headers: { Accept: "application/json", Pragma: "no-cache" },
    });
    const json = (await res.json()) as Session;
    setSession(json);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    // re-check on tab focus / visibility
    const onFocus = () => load();
    const onVisible = () =>
      document.visibilityState === "visible" && load();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  return { ...session, loading, refresh: load };
}

/** Scrolling announcement bar (marquee-like) using CSS keyframes */
function AnnouncementBar() {
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-8 bg-brand text-white overflow-hidden">
      <div className="relative h-8">
        <div className="absolute inset-y-0 left-0 flex items-center">
          <div className="marquee-track whitespace-nowrap text-xs leading-8 will-change-transform">
            <span className="mx-6"><strong>All templates & journals are FREE — no checkout needed</strong></span>
            <span className="mx-6"><strong>New:</strong> SOPs Pack</span>
            <span className="mx-6"><strong>Tools:</strong> Risk Register, Stakeholder Matrix &amp; more</span>
            {/* duplicate for seamless loop */}
            <span className="mx-6"><strong>All templates & journals are FREE — no checkout needed</strong></span>
            <span className="mx-6"><strong>New:</strong> SOPs Pack</span>
            <span className="mx-6"><strong>Tools:</strong> Risk Register, Stakeholder Matrix &amp; more</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes wfk-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: inline-block;
          padding-left: 100%;
          animation: wfk-marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { ok, user, loading, refresh } = useSession();

  // Close mobile menu on route change and on ESC
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    await refresh();       // re-check session (should be logged out)
    router.refresh?.();    // revalidate route cache
  };

  return (
    <>
      <AnnouncementBar />

      {/* Header sits below the bar (top-8) */}
      <header className="fixed inset-x-0 top-8 z-40 border-b border-gray-300 bg-gray-100/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Image
              src="/logo.png"
              alt="WorkflowKits"
              width={56}
              height={56}
              priority
              className="h-10 w-auto object-contain md:h-12"
              sizes="(min-width: 768px) 56px, 40px"
            />
            <span className="font-semibold text-lg md:text-xl">WorkflowKits</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <Link className="hover:text-brand" href="/">Home</Link>
            <Link className="hover:text-brand" href="/blog">Blog</Link>
            <Link className="hover:text-brand" href="/categories/Templates">Templates</Link>
            <Link className="hover:text-brand" href="/categories/Journals">Journals</Link>
            <Link className="hover:text-brand" href="/categories/E-Books">E-Books</Link>
            <Link className="hover:text-brand" href="/categories/Tools">Tools</Link>

            {/* Auth area */}
            <div className="ml-3 pl-3 border-l border-gray-300 flex items-center gap-2">
              {loading ? null : ok && user ? (
                <>
                  <span className="text-gray-600">{user.email}</span>
                  <button onClick={logout} className="brand-btn">Logout</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="ghost-btn">Sign in</Link>
                  <Link href="/register" className="brand-btn">Create account</Link>
                </>
              )}
            </div>
          </nav>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 bg-white"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile slide-down panel */}
        <div
          id="mobile-nav"
          className={`md:hidden overflow-hidden border-t border-gray-200 bg-white transition-[max-height] duration-300 ${
            open ? "max-h-[480px]" : "max-h-0"
          }`}
        >
          <div className="px-4 py-3 space-y-1 text-base">
            <Link className="block rounded-lg px-3 py-2 hover:bg-gray-50" href="/">Home</Link>
            <Link className="block rounded-lg px-3 py-2 hover:bg-gray-50" href="/blog">Blog</Link>
            <Link className="block rounded-lg px-3 py-2 hover:bg-gray-50" href="/categories/Templates">Templates</Link>
            <Link className="block rounded-lg px-3 py-2 hover:bg-gray-50" href="/categories/Journals">Journals</Link>
            <Link className="block rounded-lg px-3 py-2 hover:bg-gray-50" href="/categories/E-Books">E-Books</Link>
            <Link className="block rounded-lg px-3 py-2 hover:bg-gray-50" href="/categories/Tools">Tools</Link>

            <div className="mt-2 border-t border-gray-200 pt-2 flex items-center gap-2">
              {loading ? null : ok && user ? (
                <>
                  <span className="text-gray-600">{user.email}</span>
                  <button onClick={logout} className="brand-btn w-full">Logout</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="ghost-btn w-full text-center">Sign in</Link>
                  <Link href="/register" className="brand-btn w-full text-center">Create account</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
