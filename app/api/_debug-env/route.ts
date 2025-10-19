// app/api/_debug-env/route.ts
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    hasResendKey: !!process.env.RESEND_API_KEY,
    resendFrom: process.env.RESEND_FROM || null,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || null,
    nodeEnv: process.env.NODE_ENV,
  });
}
