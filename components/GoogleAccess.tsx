"use client";
import { useEffect, useRef, useState } from "react";
import { TERMS_VERSION } from "@/lib/terms";
import { returnPath } from "@/lib/returnPath";

declare global {
  interface Window { google?: { accounts: { id: { initialize: (options: Record<string, unknown>) => void; renderButton: (element: HTMLElement, options: Record<string, unknown>) => void } } }; }
}
let scriptPromise: Promise<void> | undefined;
function loadGoogle() {
  if (window.google?.accounts.id) return Promise.resolve();
  if (!scriptPromise) scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById("google-identity-script") as HTMLScriptElement | null;
    const script = existing || document.createElement("script");
    script.id = "google-identity-script"; script.src = "https://accounts.google.com/gsi/client"; script.async = true;
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => { scriptPromise = undefined; script.remove(); reject(new Error("Google sign-in could not load. Please use email sign-in or try again.")); }, { once: true });
    if (!existing) document.head.appendChild(script);
  });
  return scriptPromise;
}
async function call(path: string, body: unknown) {
  const response = await fetch(`/api/auth/google/${path}`, { method: "POST", credentials: "same-origin", cache: "no-store", headers: { "Content-Type": "application/json", "X-WK-Auth": "1" }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Google sign-in could not be completed.");
  return data;
}

export default function GoogleAccess({ mode, acceptedTerms = false, next }: { mode: "login" | "register"; acceptedTerms?: boolean; next: string }) {
  const [enabled, setEnabled] = useState<boolean | null>(null), [error, setError] = useState(""), [busy, setBusy] = useState(false), [stage, setStage] = useState<"register" | "link" | null>(null), [email, setEmail] = useState(""), [password, setPassword] = useState(""), [acceptedHere, setAcceptedHere] = useState(false), [retry, setRetry] = useState(0);
  const target = useRef<HTMLDivElement>(null), latestAcceptance = useRef(acceptedTerms);
  latestAcceptance.current = acceptedTerms;
  const canUse = mode !== "register" || acceptedTerms;
  useEffect(() => { let active = true; fetch("/api/auth/google/config", { cache: "no-store" }).then(response => response.json()).then(data => { if (active) setEnabled(data.enabled === true); }).catch(() => { if (active) setEnabled(false); }); return () => { active = false; }; }, []);
  function result(data: { ok?: boolean; mode?: string; email?: string }) {
    if (data.ok) { window.location.assign(returnPath(next)); return; }
    if (data.mode === "register" || data.mode === "link") { setStage(data.mode); setEmail(data.email || ""); setAcceptedHere(false); setPassword(""); return; }
    throw new Error("Google sign-in could not be completed. Please start again.");
  }
  useEffect(() => {
    if (!enabled || !canUse || stage || !target.current) return;
    let active = true;
    setError("");
    Promise.all([loadGoogle(), call("challenge", {})]).then(([, challenge]) => {
      if (!active || !target.current || !window.google) return;
      window.google.accounts.id.initialize({ client_id: challenge.clientId, nonce: challenge.nonce, auto_select: false, callback: async ({ credential }: { credential: string }) => {
        if (!active) return;
        if (mode === "register" && !latestAcceptance.current) { setError("Accept the Terms and Conditions before continuing with Google."); return; }
        setBusy(true); setError("");
        try { result(await call("credential", { credential, acceptedTerms: mode === "register" && latestAcceptance.current, termsVersion: TERMS_VERSION })); }
        catch (e) { setError((e as Error).message); }
        finally { setBusy(false); }
      } });
      target.current.replaceChildren();
      window.google.accounts.id.renderButton(target.current, { type: "standard", theme: "outline", size: "large", shape: "rectangular", text: mode === "register" ? "signup_with" : "signin_with", width: Math.max(200, Math.min(340, target.current.clientWidth)) });
    }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; target.current?.replaceChildren(); };
  }, [enabled, canUse, stage, retry]);

  async function finish() {
    if (busy || (stage === "register" && !(mode === "register" ? acceptedTerms : acceptedHere))) return;
    setBusy(true); setError("");
    try { result(await call("finish", { kind: stage, password, acceptedTerms: mode === "register" ? acceptedTerms : acceptedHere, termsVersion: TERMS_VERSION })); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  return <div className="google-access">
    <div ref={target} className={`google-button${busy ? " google-busy" : ""}`} hidden={!enabled || !canUse || !!stage} />
    {enabled === null && <p className="google-note" role="status">Loading Google sign-in…</p>}
    {enabled === false && <><button type="button" className="google-placeholder" disabled>{mode === "register" ? "Sign up" : "Sign in"} with Google</button><p className="google-note">Google sign-in setup is pending. Existing accounts can still use email sign-in.</p></>}
    {enabled && !canUse && <><button type="button" className="google-placeholder" disabled>Sign up with Google</button><p className="google-note">Accept the Terms and Conditions below to enable Google sign-up.</p></>}
    {stage && <div className="google-completion"><p className="google-note">Google verified: <strong>{email}</strong></p>{stage === "link" ? <><p className="google-note">This email already has a WorkflowKits account. Enter its existing password to safely connect Google.</p><label>Existing account password<input className="input" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} /></label></> : <><p className="google-note">Finish creating your resource account by accepting the current terms.</p>{mode === "login" && <div className="terms-acceptance"><input id="google-accept-terms" type="checkbox" checked={acceptedHere} onChange={event => setAcceptedHere(event.target.checked)} /><label htmlFor="google-accept-terms">I have read and accept the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms and Conditions</a>.</label></div>}</>}<button type="button" className="brand-btn w-full mt-4" disabled={busy || (stage === "link" ? !password : !(mode === "register" ? acceptedTerms : acceptedHere))} onClick={() => void finish()}>{busy ? "Please wait…" : stage === "link" ? "Connect Google and sign in" : "Create account with Google"}</button></div>}
    {busy && <p className="google-note" role="status">Verifying your Google account…</p>}
    {error && <p className="google-error" role="alert">{error}</p>}
    {(error || stage) && <button type="button" className="google-retry" disabled={busy} onClick={() => { setStage(null); setError(""); setRetry(value => value + 1); }}>Start Google sign-in again</button>}
    <div className="auth-divider"><span />or {mode === "register" ? "register" : "sign in"} with email<span /></div>
  </div>;
}
