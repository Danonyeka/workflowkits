// app/login/LoginClient.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { returnPath } from "@/lib/returnPath";
import GoogleAccess from "@/components/GoogleAccess";

export default function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const router = useRouter();
  const sp = useSearchParams();
  const next = returnPath(sp?.get("next"));

  const waitUntilSessionVisible = async () => {
    const started = Date.now();
    while (Date.now() - started < 2500) {
      try {
        const r = await fetch(`/api/auth/session?ts=${Date.now()}`, {
          credentials: "include",
          cache: "no-store",
          headers: { Accept: "application/json", "Cache-Control": "no-cache" },
        });
        const d = await r.json();
        if (d?.ok) return true;
      } catch {}
      await new Promise((res) => setTimeout(res, 120));
    }
    return false;
  };

  const submit = async () => {
    if (loading) return;
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data?.ok) {
        await waitUntilSessionVisible();

        // fire signals for header in current tab and other tabs
        try { new BroadcastChannel("wk_auth").postMessage("changed"); } catch {}
        localStorage.setItem("wk_auth_ping", String(Date.now()));
        window.dispatchEvent(new Event("wk-auth-changed"));

        // Do a HARD navigation so the header renders authenticated immediately
        window.location.assign(next);
        return;
      }
      setErr(data?.error || "Invalid credentials");
    } catch (e: any) {
      setErr(e?.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-page mx-auto surface space-y-5" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
      <h1 className="h2">Sign in</h1>
      <p>Welcome back. Sign in to your WorkflowKits resource account.</p>
      <p className="account-legal-links">Review our <a href="/terms">Terms and Conditions</a> and <a href="/privacy">Privacy Notice</a>.</p>
      <GoogleAccess mode="login" next={next} />
      <label>Email address
      <input
        className="input"
        placeholder="Email"
        type="email"
        required autoComplete="username" name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      </label><label>Password
      <input
        className="input"
        placeholder="Password"
        type="password"
        required autoComplete="current-password" name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      </label><p className="text-sm"><a className="underline" href="/forgot-password">Forgot password?</a></p>{err && <div role="alert" className="text-sm text-red-700">{err}</div>}
      <button type="submit" className="brand-btn w-full" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </button>
      <p className="text-xs text-gray-500">
        No account?{" "}
        <a className="underline" href={`/register?next=${encodeURIComponent(next)}`}>
          Create one
        </a>
      </p>
      <p className="text-xs">Looking for your business workspace? <a className="underline" href="https://pos.workflowkits.com/">Open WDT POS ↗</a></p>
    </form>
  );
}
