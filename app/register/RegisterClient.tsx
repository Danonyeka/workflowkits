// app/register/RegisterClient.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function RegisterClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const router = useRouter();
  const sp = useSearchParams();
  const next = sp?.get("next") ?? "/";

  const waitUntilSessionVisible = async () => {
    const started = Date.now();
    while (Date.now() - started < 3000) {
      try {
        const r = await fetch(`/api/auth/session?ts=${Date.now()}`, {
          credentials: "include",
          cache: "no-store",
          headers: { Accept: "application/json", "Cache-Control": "no-cache" },
        });
        const d = await r.json();
        if (d?.ok) return true;
      } catch {}
      await new Promise((res) => setTimeout(res, 150));
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
        const ok = await waitUntilSessionVisible();
        try { new BroadcastChannel("wk_auth").postMessage("changed"); } catch {}
        localStorage.setItem("wk_auth_ping", String(Date.now()));

        router.replace(next);
        router.refresh();
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
    <div className="max-w-md mx-auto surface p-6 space-y-4">
      <h1 className="h2">Create account</h1>
      <input
        className="input"
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="input"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {err && <div className="text-sm text-red-600">{err}</div>}
      <button className="brand-btn w-full" disabled={loading} onClick={submit}>
        {loading ? "Creating account..." : "Create account"}
      </button>
      <p className="text-xs text-gray-500">
        Already have an account?{" "}
        <a className="underline" href={`/login?next=${encodeURIComponent(next)}`}>
          Sign in
        </a>
      </p>
    </div>
  );
}
