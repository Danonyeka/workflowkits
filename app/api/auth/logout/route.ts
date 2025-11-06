// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function noStoreJson(body: any, status = 200) {
  return new NextResponse(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
    },
  });
}

export async function POST() {
  clearSessionCookie();                 // clears host-only + .domain + no-dot
  return noStoreJson({ ok: true });
}

export async function GET(req: NextRequest) {
  clearSessionCookie();
  const origin = req.nextUrl.origin;    // always valid for this request
  const res = NextResponse.redirect(new URL("/", origin), { status: 302 });
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.headers.set("Pragma", "no-cache");
  return res;
}
