// app/api/auth/session/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

// Ensure this route is never statically cached
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  // If your getSession is synchronous, remove `await`
  const s = await getSession(); 
  return NextResponse.json(
    { ok: !!s, user: s ?? null },
    { headers: { "Cache-Control": "no-store" } }
  );
}
