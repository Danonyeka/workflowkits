"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const [email, setEmail] = useState(""); const [name, setName] = useState("");
  const [password, setPassword] = useState(""); const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter(); const next = useSearchParams().get("next") || "/";

  const submit = async () => {
    setErr(null); setLoading(true);
    const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, name })});
    const data = await res.json(); setLoading(false);
    if (data.ok) router.push(next); else setErr(data.error || "Error");
  };

  return (
    <div className="max-w-md mx-auto surface p-6 space-y-4">
      <h1 className="h2">Create your account</h1>
      <input className="input" placeholder="Name (optional)" value={name} onChange={e=>setName(e.target.value)} />
      <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="input" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      {err && <div className="text-sm text-red-600">{err}</div>}
      <button className="brand-btn w-full" disabled={loading} onClick={submit}>{loading?"Creating...":"Create account"}</button>
    </div>
  );
}
