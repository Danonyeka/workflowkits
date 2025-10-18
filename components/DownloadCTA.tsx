"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function DownloadCTA({ slug }: { slug: string }) {
  const [sending, setSending] = useState(false);
  const router = useRouter();
  const pathname = usePathname() || "/";

  const sendLink = async () => {
    try {
      setSending(true);
      const res = await fetch("/api/send-download-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });

      if (res.status === 401) {
        // not logged in -> take to register/login with return path
        router.push(`/register?next=${encodeURIComponent(pathname)}`);
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to send");

      alert("Download link sent to your email 🎉");
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
