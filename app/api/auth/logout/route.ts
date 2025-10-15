import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export function POST() {
  clearSessionCookie();
  return NextResponse.json({ ok: true });
}
