// app/api/email-download/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import React from "react"; // needed for createElement
import DownloadLinkEmail from "@/emails/DownloadLinkEmail";
import { getSession } from "@/lib/auth";
import jwt from "jsonwebtoken";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);

// Map product slug -> actual filename in data/downloads (or wherever you store files)
const FILES: Record<string, string> = {
  "project-charter-template": "project_charter_template.docx",
  "project-execution-plan": "project-execution-plan.docx",
  "lessons-learned-journal": "lessons-learned-journal.pdf",
};

function titleFromSlug(slug: string) {
  const map: Record<string, string> = {
    "project-charter-template": "Advanced Project Charter Template",
    "project-execution-plan": "Project Execution Plan (MS Word)",
    "lessons-learned-journal": "Lessons Learned Journal (PDF)",
  };
  return map[slug] || slug.replace(/-/g, " ");
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug")?.trim();
  const toOverride = url.searchParams.get("to")?.trim(); // debug/testing only

  if (!slug) {
    return NextResponse.json({ ok: false, error: "Missing slug" }, { status: 400 });
  }
  const filename = FILES[slug];
  if (!filename) {
    return NextResponse.json({ ok: false, error: "Unknown product slug" }, { status: 404 });
  }

  const session = getSession();
  const to = toOverride || session?.email;
  if (!to) {
    return NextResponse.json({ ok: false, error: "Not logged in" }, { status: 401 });
  }

  // Build a signed, time-limited token for /api/download
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "Missing JWT_SECRET" }, { status: 500 });
  }
  const token = jwt.sign({ slug, filename }, secret, { expiresIn: "24h" });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${url.protocol}//${url.host}`;
  const downloadUrl = `${siteUrl}/api/download?token=${encodeURIComponent(token)}`;
  const productTitle = titleFromSlug(slug);

  const from = process.env.RESEND_FROM;
  if (!from) {
    return NextResponse.json(
      { ok: false, error: "Missing RESEND_FROM (e.g. 'WorkflowKits <noreply@workflowkits.com>')" },
      { status: 500 }
    );
  }

  // ✅ No JSX here — create the React element programmatically
  const emailReact = React.createElement(DownloadLinkEmail, {
    downloadUrl,
    productTitle,
    siteUrl,
    userName: session?.email?.split("@")[0],
    expiresText: "24 hours",
    fileName: filename,
    supportEmail: "support@workflowkits.com",
  });

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: `Your WorkflowKits download: ${productTitle}`,
      react: emailReact,
    });

    if (error) {
      return NextResponse.json({ ok: false, error }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data?.id, to, slug, downloadUrl });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Send failed" }, { status: 500 });
  }
}
