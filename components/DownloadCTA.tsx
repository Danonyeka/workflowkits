// components/DownloadCTA.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function DownloadCTA({ slug }: { slug: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => setAuthed(!!d.ok))
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) return null;

  if (!authed) {
    return (
      <button
        className="brand-btn"
        onClick={() => router.push(`/register?next=${encodeURIComponent(pathname)}`)}
      >
        Create free account to download
      </button>
    );
  }

  return (
    <button
      className="brand-btn"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        const res = await fetch(
          `/api/free-download?slug=${encodeURIComponent(slug)}&next=${encodeURIComponent(pathname)}`
        );

        if (!res.ok) {
          setLoading(false);
          if (res.redirected) window.location.href = res.url;
          else alert("Could not start download");
          return;
        }

        // stream to file
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = ""; // server provides filename
        a.click();
        URL.revokeObjectURL(url);
        setLoading(false);
      }}
    >
      {loading ? "Preparing…" : "Download"}
    </button>
  );
}
