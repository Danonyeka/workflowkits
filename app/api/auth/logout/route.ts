// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

const AUTH_COOKIE = "wk_session"; // use your cookie name

export const runtime = "nodejs";

// Called via fetch() from the client so it won't navigate
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
    expires: new Date(0),
    sameSite: "lax",
  });
  return res;
}

// If someone hits the URL directly in the browser, still clear then redirect
export async function GET() {
  const res = NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"));
  res.cookies.set(AUTH_COOKIE, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
    expires: new Date(0),
    sameSite: "lax",
  });
  return res;
}
