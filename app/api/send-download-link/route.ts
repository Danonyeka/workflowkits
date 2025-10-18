import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { Resend } from "resend";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const sess = getSession();
    if (!sess?.email) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const { slug } = await req.json();
    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    const secret = process.env.JWT_SECRET!;
    const site = process.env.NEXT_PUBLIC_SITE_URL!;
    if (!secret || !site) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    // token valid for 60 minutes – adjust as you like
    const token = jwt.sign({ slug, email: sess.email }, secret, { expiresIn: "60m" });

    const url = `${site}/api/free-download?slug=${encodeURIComponent(slug)}&token=${encodeURIComponent(token)}`;

    // Send email
    const from = process.env.RESEND_FROM!;
    await resend.emails.send({
      from,
      to: sess.email,
      subject: "Your WorkflowKits download link",
      html: `
        <div style="font-family:system-ui,Segoe UI,Arial,sans-serif">
          <h2>Here’s your download link</h2>
          <p>This link is valid for 60 minutes:</p>
          <p><a href="${url}" target="_blank" rel="noopener">Download your file</a></p>
          <p style="color:#666">If you didn’t request this, you can ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to send" }, { status: 500 });
  }
}
