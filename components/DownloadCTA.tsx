"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function DownloadCTA({ slug }: { slug: string }) {
  const [sending, setSending] = useState(false);
  const router = useRouter();
  const pathname = usePathname() || "/";

  const sendLink = async () => {
    if (!slug || sending) return;
    setSending(true);

    try {
      const url = `/api/email-download?slug=${encodeURIComponent(slug)}`;

      const res = await fetch(url, {
        method: "GET",
        // ensure auth cookie (wk_session) is sent
        credentials: "include",
        // avoid stale caches / CDNs
        cache: "no-store",
        headers: { Accept: "application/json" },
        // if middleware issues a redirect, don't follow — handle explicitly
        redirect: "manual",
      });

      if (res.status === 401) {
        // not logged in -> take to register/login with return path
        router.push(`/register?next=${encodeURIComponent(pathname)}`);
        return;
      }

      // If something tried to redirect, treat as unauth
      if (res.type === "opaqueredirect" || res.status === 307 || res.status === 308) {
        router.push(`/register?next=${encodeURIComponent(pathname)}`);
        return;
      }

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok || !data?.ok) {
        const msg =
          data?.error ||
          data?.message ||
          `Failed to send download link (status ${res.status})`;
        alert(`Email failed ❌\n${msg}\nTo: ${data?.to ?? "unknown"}`);
        return;
      }

      alert(`Email queued ✅\nTo: ${data.to}\nMessage ID: ${data.id ?? "(none)"}`);
    } catch (e: any) {
      alert(e?.message || "Could not send link");
    } finally {
      setSending(false);
    }
  };

  return (
    <button className="brand-btn" onClick={sendLink} disabled={sending}>
      {sending ? "Sending link..." : "Email me the download link"}
    </button>
  );
}
