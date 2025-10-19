// app/api/email-download/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("debug") === "1") {
    return NextResponse.json({
      hasResendKey: !!process.env.RESEND_API_KEY,
      resendFrom: process.env.RESEND_FROM || null,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || null,
      nodeEnv: process.env.NODE_ENV,
    });
  }

  // ...your existing logic...
}
