// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Block direct hits to /downloads/* (served from /public)
  if (req.nextUrl.pathname.startsWith("/downloads/")) {
    const next = req.nextUrl.pathname + req.nextUrl.search;
    return NextResponse.redirect(
      new URL(`/register?next=${encodeURIComponent(next)}`, req.url)
    );
  }
  return NextResponse.next();
}

// Only run on these paths
export const config = {
  matcher: ["/downloads/:path*"],
};
