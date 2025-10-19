// app/api/email-download/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * IMPORTANT for EU region:
 * Your domain is in Ireland (eu-west-1). Point the SDK to EU API.
 * If your Resend domain were US, remove the baseUrl option.
 */
const resend = new Resend(process.env.RESEND_API_KEY, {
  baseUrl: "https://api.eu.resend.com",
});

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug")?.trim();
  const toOverride = url.searchParams.get("to")?.trim();

  if (!slug) {
    return NextResponse.json({ ok: false, error: "Missing slug" }, { status: 400 });
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://workflowkits.com";
  const from = process.env.RESEND_FROM?.trim(); // e.g. WorkflowKits <noreply@workflowkits.com>

  // Who are we emailing?
  const session = getSession();
  const to = toOverride || session?.email || "";

  // Helpful env validation so you get clear messages instead of generic errors
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { ok: false, error: "Missing RESEND_API_KEY env var" },
      { status: 500 }
    );
  }
  if (!from) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Missing RESEND_FROM env var. Use a verified domain address, e.g. 'WorkflowKits <noreply@workflowkits.com>'.",
      },
      { status: 500 }
    );
  }
  if (!to) {
    return NextResponse.json(
      { ok: false, error: "Not logged in / no recipient email" },
      { status: 401 }
    );
  }

  // Build a public download URL (adjust extension per product)
  const fileUrl = `${siteUrl}/downloads/${slug}.pdf`;

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      subject: `Your WorkflowKits download: ${slug}`,
      text: `Here is your download link:\n${fileUrl}\n\nThanks!`,
      html: `<p>Here is your download link:</p><p><a href="${fileUrl}">${fileUrl}</a></p><p>Thanks!</p>`,
    });

    // Server log for Vercel > Functions > Logs
    console.log("EMAIL-DOWNLOAD", {
      slug,
      to,
      from,
      siteUrl,
      euApi: "https://api.eu.resend.com",
      id: data?.id,
      error,
    });

    if (error) {
      // Bubble up the exact Resend error so you can see it in the alert
      return NextResponse.json(
        { ok: false, to, slug, fileUrl, resendError: error },
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
