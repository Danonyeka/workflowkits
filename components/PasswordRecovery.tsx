"use client";
import { useEffect, useRef, useState } from "react";
export default function PasswordRecovery({ reset = false }: { reset?: boolean }) {
  const [email, setEmail] = useState(""), [password, setPassword] = useState(""), [confirmation, setConfirmation] = useState(""), [token, setToken] = useState(""), [busy, setBusy] = useState(false), [done, setDone] = useState(false), [error, setError] = useState("");
  const captured = useRef(false);
  useEffect(() => { if (reset && !captured.current) { captured.current = true; setToken(window.location.hash.slice(1)); window.history.replaceState(null, "", window.location.pathname); } }, [reset]);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); if (busy) return;
    if (reset && password !== confirmation) { setError("The passwords do not match."); return; }
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/auth/${reset ? "reset-password" : "forgot-password"}`, { method: "POST", headers: { "Content-Type": "application/json", "X-WK-Auth": "1" }, body: JSON.stringify(reset ? { token, password } : { email }), cache: "no-store" });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Please try again."); setDone(true); setPassword(""); setConfirmation(""); setToken("");
    } catch (error) { setError((error as Error).message); } finally { setBusy(false); }
  }
  return <form className="auth-page mx-auto surface space-y-5" onSubmit={submit}><h1 className="h2">{reset ? "Choose a new password" : "Forgot password?"}</h1>{done ? <p role="status">{reset ? "Your password has been updated. Sign in with your new password or Google. Previous website sessions have been signed out." : "If an account exists for that email, we will send a password reset link. Check your inbox and spam folder. You can also sign in with Google."}</p> : <>{reset ? <><p>Choose at least 12 characters. The reset link expires after 30 minutes and can only be used once.</p>{!token && <p role="alert">Open the complete link from your reset email. If the link is missing or expired, <a className="underline" href="/forgot-password">request a new link</a>.</p>}<label>New password<input className="input" type="password" required minLength={12} maxLength={72} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} /></label><label>Confirm new password<input className="input" type="password" required minLength={12} maxLength={72} autoComplete="new-password" value={confirmation} onChange={e => setConfirmation(e.target.value)} /></label></> : <><p>Enter your website account email and we will send a private password reset link. WDT POS accounts are managed separately.</p><label>Email address<input className="input" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></label></>}{error && <p role="alert">{error}</p>}<button className="brand-btn w-full" disabled={busy || (reset && !token)}>{busy ? "Please wait…" : reset ? "Update password" : "Send reset link"}</button></>}<p><a className="underline" href="/login">Back to sign in or continue with Google</a></p><p className="account-legal-links"><a href="/privacy">Privacy Notice</a> · <a href="/terms">Terms and Conditions</a></p></form>;
}
