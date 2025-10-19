// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Keep this in sync with your auth cookie name
const AUTH_COOKIE = "wk_session";

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Gate ONLY direct static files under /downloads/*
  if (pathname.startsWith("/downloads/")) {
    const hasSession = Boolean(req.cookies.get(AUTH_COOKIE)?.value);

    if (!hasSession) {
      const next = pathname + search; // preserve target so we can bounce back after auth
      const url = new URL(`/register?next=${encodeURIComponent(next)}`, req.url);
      return NextResponse.redirect(url);
    }

    // logged in → allow
    return NextResponse.next();
  }

  // allow everything else (including API routes like /api/email-download)
  return NextResponse.next();
}

// Only run on the downloads paths
export const config = {
  matcher: ["/downloads/:path*"],
};
