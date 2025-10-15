import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export function GET() {
  const s = getSession();
  return NextResponse.json({ ok: !!s, user: s || null });
}
