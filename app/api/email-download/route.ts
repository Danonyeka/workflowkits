// app/api/email-download/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";
const resend = new Resend(process.env.RESEND_API_KEY);

// REPLACE this with your real session getter
function getSessionEmail(): string | null {
  try {
    // pull from your wk_session JWT, or however you store the email
    // return "you@gmail.com";
    return null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  const toOverride = url.searchParams.get("to"); // for testing

  if (!slug) {
    return NextResponse.json({ ok: false, error: "Missing slug" }, { status: 400 });
  }

  // Build the public file URL you want to email (adjust path/extension)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://workflowkits.com";
  const fileUrl = `${siteUrl}/downloads/${slug}.pdf`; // change per product

  // Who are we emailing?
  const to = toOverride || getSessionEmail();

  if (!to) {
    return NextResponse.json({ ok: false, error: "Not logged in / no recipient" }, { status: 401 });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM!, // "WorkflowKits <noreply@workflowkits.com>"
      to: [to],
      subject: `Your WorkflowKits download: ${slug}`,
      text: `Here is your download link:\n${fileUrl}\n\nThanks!`,
      html: `<p>Here is your download link:</p><p><a href="${fileUrl}">${fileUrl}</a></p><p>Thanks!</p>`,
    });

    // Log to server logs so you can see this in Vercel -> Functions -> Logs
    console.log("EMAIL-DOWNLOAD: slug=%s to=%s id=%s err=%o", slug, to, data?.id, error);

    if (error) {
      return NextResponse.json(
        { ok: false, to, slug, fileUrl, error },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, to, slug, fileUrl, id: data?.id });
  } catch (e: any) {
    console.error("EMAIL-DOWNLOAD exception:", e);
    return NextResponse.json(
      { ok: false, to, slug, message: e?.message || "Send failed" },
      { status: 500 }
    );
  }
}
