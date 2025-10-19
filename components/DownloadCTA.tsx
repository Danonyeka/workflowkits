"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function DownloadCTA({ slug }: { slug: string }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();
  const pathname = usePathname() || "/";

  const sendLink = async () => {
    if (!slug || sending) return;
    setSending(true);

    try {
      const url = `/api/email-download?slug=${encodeURIComponent(slug)}`;

      const res = await fetch(url, {
        method: "GET",
        credentials: "include",     // ensure wk_session is sent
        cache: "no-store",
        headers: { Accept: "application/json" },
        redirect: "manual",         // detect middleware/edge redirects
      });

      // Unauthed → go create account (preserve return path)
      if (res.status === 401 || res.type === "opaqueredirect" || res.status === 307 || res.status === 308) {
        router.push(`/register?next=${encodeURIComponent(pathname)}`);
        return;
      }

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok || !data?.ok) {
        const msg = data?.error || data?.message || `Failed to send download link (status ${res.status})`;
        alert(`Email failed ❌\n${msg}\nTo: ${data?.to ?? "unknown"}`);
        return;
      }

      setSent(true);
      alert(`Email queued ✅\nTo: ${data.to}\nMessage ID: ${data.id ?? "(none)"}`);
    } catch (e: any) {
      alert(e?.message || "Could not send link");
    } finally {
      setSending(false);
      // Optionally re-enable after a short delay
      setTimeout(() => setSent(false), 5000);
    }
  };

  return (
    <button
      className="brand-btn"
      onClick={sendLink}
      disabled={sending || sent}
      aria-busy={sending}
      aria-disabled={sending || sent}
    >
      {sending ? "Sending link..." : sent ? "Link sent ✓" : "Email me the download link"}
    </button>
  );
}
