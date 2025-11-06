// app/api/auth/session/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

// Never allow static or ISR caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

export function GET() {
  const s = getSession(); // sync
  return NextResponse.json(
    { ok: !!s, user: s ?? null, ts: Date.now() },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}
