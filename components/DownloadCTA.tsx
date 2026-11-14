// components/DownloadCTA.tsx
"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function DownloadCTA({ slug }: { slug: string }) {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const router = useRouter();
  const pathname = usePathname() || "/";

  const sendLink = async () => {
    if (!slug || sending) return;
    setSending(true);
    setMessage(""); setFailed(false);

    try {
      const url = `/api/email-download?slug=${encodeURIComponent(slug)}`;
      const res = await fetch(url, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: { Accept: "application/json" },
        redirect: "manual",
      });

      if (res.status === 401 || res.type === "opaqueredirect" || res.status === 307 || res.status === 308) {
        router.push(`/register?next=${encodeURIComponent(pathname)}`);
        return;
      }

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok || !data?.ok) {
        setFailed(true); setMessage("We couldn’t send your download link. Please try again or contact WorkflowKits support.");
        return;
      }

      setMessage("Your download link has been sent to your account email. Check your inbox and spam folder.");
    } catch (e: any) {
      setFailed(true); setMessage("We couldn’t connect. Please check your connection and try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div><button className="brand-btn" onClick={sendLink} disabled={sending}>
      {sending ? "Sending link..." : "Email me the download link"}
    </button>{message && <p role={failed ? "alert" : "status"} className={`mt-3 max-w-sm text-sm ${failed ? "text-red-700" : "text-cyan-900"}`}>{message}</p>}</div>
  );
}
