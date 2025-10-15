// app/api/_test-email/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

export async function GET() {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM;
    const to = process.env.TEST_TO || "you@example.com"; // set TEST_TO in .env.local or hardcode for a quick test

    if (!apiKey) return NextResponse.json({ error: "Missing RESEND_API_KEY" }, { status: 500 });
    if (!from) return NextResponse.json({ error: "Missing RESEND_FROM" }, { status: 500 });

    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: "Test email from WorkflowKits",
      html: "<p>It works 🎉</p>",
    });

    if (error) return NextResponse.json({ error }, { status: 500 });
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}
