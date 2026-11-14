"use client";
import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
type Session = { ok: boolean; user: { id: string; email: string } | null };
const navigation = [{ href: "/catalog", label: "Resources" }, { href: "/business-software", label: "Business software" }, { href: "/blog", label: "Guides" }, { href: "/about", label: "About" }];
export function Header() {
  const pathname = usePathname() ?? "", router = useRouter();
  const [open, setOpen] = useState(false), [session, setSession] = useState<Session>({ ok: false, user: null }), [loading, setLoading] = useState(true), [logoutBusy, setLogoutBusy] = useState(false), [error, setError] = useState("");
  const software = pathname.startsWith("/business-software");
  const refresh = useCallback(async () => {
    try { const res = await fetch("/api/auth/session", { credentials: "include", cache: "no-store" }); if (!res.ok) throw new Error("Session unavailable"); setSession(await res.json()); }
    catch { setSession({ ok: false, user: null }); } finally { setLoading(false); }
  }, []);
  useEffect(() => { void refresh(); const update = () => { if (document.visibilityState === "visible") void refresh(); }; window.addEventListener("focus", update); window.addEventListener("wk-auth-changed", update); document.addEventListener("visibilitychange", update); return () => { window.removeEventListener("focus", update); window.removeEventListener("wk-auth-changed", update); document.removeEventListener("visibilitychange", update); }; }, [refresh]);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => { const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); document.getElementById("menu-toggle")?.focus(); } }; window.addEventListener("keydown", escape); return () => window.removeEventListener("keydown", escape); }, []);
  async function logout() { setLogoutBusy(true); setError(""); try { const res = await fetch("/api/auth/logout", { method: "POST", credentials: "include" }); if (!res.ok) throw new Error("Could not sign out. Please try again."); await refresh(); router.refresh(); } catch (e) { setError((e as Error).message); } finally { setLogoutBusy(false); } }
  const account = software ? <a className="brand-btn" href="https://pos.workflowkits.com/">Open WDT POS <span aria-hidden="true">↗</span></a> : loading ? <span className="text-xs text-gray-500" role="status">Checking account…</span> : session.ok && session.user ? <><span className="account-email" title={session.user.email}>{session.user.email}</span><button className="ghost-btn" onClick={logout} disabled={logoutBusy}>{logoutBusy ? "Signing out…" : "Sign out"}</button></> : <><Link className="header-signin" href="/login">Sign in</Link><Link className="brand-btn" href="/register">Create account</Link></>;
  return <><a className="skip-link" href="#main-content">Skip to content</a><header className="site-header"><div className="site-header-inner container"><Link href="/" className="site-logo" aria-label="WorkflowKits home"><Image src="/logo.png" alt="" width={44} height={44} priority /><span>WorkflowKits<small>RESOURCES & BUSINESS SOFTWARE</small></span></Link><nav aria-label="Main navigation" className="desktop-navigation">{navigation.map(({ href, label }) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>{label}</Link>)}</nav><div className="desktop-account">{account}</div><button id="menu-toggle" className="menu-toggle" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d={open ? "M6 6l12 12M18 6L6 18" : "M4 6h16M4 12h16M4 18h16"} /></svg></button></div><nav id="mobile-navigation" aria-label="Mobile navigation" hidden={!open} className="mobile-navigation container">{navigation.map(({ href, label }) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>{label}</Link>)}<div className="mobile-account">{account}</div></nav>{error && <p role="alert" className="container py-2 text-sm text-red-700">{error}</p>}</header></>;
}
