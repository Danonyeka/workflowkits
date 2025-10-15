// components/DownloadCTA.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function DownloadCTA({ slug }: { slug: string }) {
  const router = useRouter();
  const pathnameRaw = usePathname();
  const pathname = pathnameRaw ?? "/"; // ✅ coerce null -> "/"
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setAuthed(!!d?.user))
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
        try {
          const res = await fetch(`/api/free-download?slug=${encodeURIComponent(slug)}`, {
            credentials: "include",
          });

          if (res.redirected) {
            window.location.href = res.url;
            return;
          }
          if (!res.ok) {
            let msg = `HTTP ${res.status}`;
            try {
              const j = await res.json();
              if (j?.error) msg = j.error;
            } catch {}
            alert(`Could not start download: ${msg}`);
            return;
          }

          const cd = res.headers.get("Content-Disposition") || "";
          const m = cd.match(/filename="?(.*?)"?$/i);
          const filename = m?.[1] || "download";

          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        } catch (e: any) {
          alert(`Could not start download: ${e?.message || e}`);
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? "Preparing…" : "Download"}
    </button>
  );
}
