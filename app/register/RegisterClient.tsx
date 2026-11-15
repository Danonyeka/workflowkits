// app/register/RegisterClient.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { returnPath } from "@/lib/returnPath";

export default function RegisterClient() {
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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data?.ok) {
        await waitUntilSessionVisible();

        try { new BroadcastChannel("wk_auth").postMessage("changed"); } catch {}
        localStorage.setItem("wk_auth_ping", String(Date.now()));
        window.dispatchEvent(new Event("wk-auth-changed"));

        window.location.assign(next);
        return;
      }
      setErr(data?.error || "Registration failed");
    } catch (e: any) {
      setErr(e?.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-page mx-auto surface space-y-5" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
      <h1 className="h2">Create account</h1>
      <p>Create your WorkflowKits resource account to request download links.</p>
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
        required autoComplete="new-password" name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      </label>{err && <div role="alert" className="text-sm text-red-700">{err}</div>}
      <p className="account-legal-links">Before creating an account, please read our <a href="/terms">Terms and Conditions</a> and <a href="/privacy">Privacy Notice</a>.</p>
      <button type="submit" className="brand-btn w-full" disabled={loading}>
        {loading ? "Creating account..." : "Create account"}
      </button>
      <p className="text-xs text-gray-500">
        Already have an account?{" "}
        <a className="underline" href={`/login?next=${encodeURIComponent(next)}`}>
          Sign in
        </a>
      </p>
      <p className="text-xs">Need a POS business account? <a className="underline" href="https://pos.workflowkits.com/">Register inside WDT POS ↗</a></p>
    </form>
  );
}
