// app/login/LoginClient.tsx 
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const router = useRouter();
  const sp = useSearchParams();
  const next = sp?.get("next") ?? "/";

  const submit = async () => {
    if (loading) return;
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",        // send/receive wk_session
        cache: "no-store",             // avoid any stale caches
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data?.ok) {
        // notify header/AuthLinks to re-check the session immediately
        window.dispatchEvent(new Event("auth:changed"));
        // navigate and ensure server components read fresh cookies
        router.replace(next);
        router.refresh();
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
    <div className="max-w-md mx-auto surface p-6 space-y-4">
      <h1 className="h2">Sign in</h1>
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
        {loading ? "Signing in..." : "Sign in"}
      </button>
      <p className="text-xs text-gray-500">
        No account?{" "}
        <a className="underline" href={`/register?next=${encodeURIComponent(next)}`}>
          Create one
        </a>
      </p>
    </div>
  );
}
