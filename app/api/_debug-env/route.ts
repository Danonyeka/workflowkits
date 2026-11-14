// app/api/_debug-env/route.ts
import { NextResponse } from "next/server";

export function GET(req: Request) {
  if (!process.env.ADMIN_PASSWORD || req.headers.get('x-admin') !== process.env.ADMIN_PASSWORD) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({
    hasResendKey: !!process.env.RESEND_API_KEY,
    resendFrom: process.env.RESEND_FROM || null,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || null,
    nodeEnv: process.env.NODE_ENV,
  });
}
