// app/api/email-download/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import jwt from "jsonwebtoken";
import { getSession } from "@/lib/auth";

// Map slugs to the *actual filename* in data/download/
const FILES: Record<string, string> = {
  "project-charter-template": "project_charter_template.docx",
  "project-execution-plan": "project-execution-plan.docx",
  "lessons-learned-journal": "lessons-learned-journal.pdf",
  // add the rest here...
};

export const runtime = "nodejs";
const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  const toOverride = url.searchParams.get("to"); // for manual testing

  if (!slug || !FILES[slug]) {
    return NextResponse.json({ ok: false, error: "Unknown or missing slug" }, { status: 400 });
  }

  // who are we emailing?
  const session = getSession();
  const to = toOverride || session?.email || "";

  if (!EMAIL_RE.test(to)) {
    return NextResponse.json(
      { ok: false, error: "Not logged in or invalid recipient" },
      { status: 401 }
    );
  }

  // sign a short-lived token with slug + filename
  const secret = process.env.JWT_SECRET!;
  const filename = FILES[slug];
  const token = jwt.sign({ slug, filename }, secret, { expiresIn: "24h" });

  // generate secure link to our API (NOT /public)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://workflowkits.com";
  const fileUrl = `${siteUrl}/api/download?token=${encodeURIComponent(token)}`;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM!, // e.g. 'WorkflowKits <noreply@workflowkits.com>'
      to: [to],
      subject: `Your WorkflowKits download`,
      text: `Here is your download link:\n${fileUrl}\n\nLink valid 24 hours.`,
      html: `<p>Here is your download link (valid 24 hours):</p><p><a href="${fileUrl}">${fileUrl}</a></p>`,
    });

    if (error) {
      return NextResponse.json({ ok: false, to, slug, error }, { status: 500 });
    }
    return NextResponse.json({ ok: true, to, slug, id: data?.id });
  } catch (e: any) {
    return NextResponse.json({ ok: false, to, slug, error: e?.message }, { status: 500 });
  }
}
