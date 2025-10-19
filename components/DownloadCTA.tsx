"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function DownloadCTA({ slug }: { slug: string }) {
  const [sending, setSending] = useState(false);
  const router = useRouter();
  const pathname = usePathname() || "/";

  const sendLink = async () => {
    if (!slug) return;
    setSending(true);

    try {
      // hit the email API (GET so you can test in the browser, too)
      const url = `/api/email-download?slug=${encodeURIComponent(slug)}`;
      const res = await fetch(url, { method: "GET" });

      if (res.status === 401) {
        // not logged in -> take to register/login with return path
        router.push(`/register?next=${encodeURIComponent(pathname)}`);
        return;
      }

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        const msg =
          data?.error ||
          data?.message ||
          `Failed to send download link (status ${res.status})`;
        alert(`Email failed ❌\n${msg}\nTo: ${data?.to ?? "unknown"}`);
        return;
      }

      // success with helpful details for verification
      alert(
        `Email queued ✅\nTo: ${data.to}\nMessage ID: ${data.id ?? "(none)"}`
      );
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
