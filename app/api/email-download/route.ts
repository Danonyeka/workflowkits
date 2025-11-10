// app/api/email-download/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import React from "react";
import jwt from "jsonwebtoken";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);

// Map product slug -> actual filename in data/downloads
const FILES: Record<string, string> = {
  "project-charter-template": "project_charter_template.docx",
  "project-execution-plan": "project-execution-plan.docx",
  "lessons-learned-journal": "lessons-learned-journal.pdf",
  "risk-register": "risk-register.xlsx",
  "project-execution-strategy": "project-execution-strategy.docx",
  "Monthly-Project-Report-Sample": "monthly-project-report-sample.docx",
};

function titleFromSlug(slug: string) {
  const map: Record<string, string> = {
    "project-charter-template": "Advanced Project Charter Template",
    "project-execution-plan": "Project Execution Plan (MS Word)",
    "lessons-learned-journal": "Lessons Learned Journal (PDF)",
    "risk-register": "Project Risk Register (Excel)",
    "project-execution-strategy": "Project Execution Strategy (MS Word)",
    "monthly-project-report-sample": "Monthly Project Report Sample (MS Word)",
  };
  return map[slug] || slug.replace(/-/g, " ");
}

// Simple branded HTML email (no extra deps)
function renderDownloadEmailHTML(opts: {
  downloadUrl: string;
  productTitle: string;
  siteUrl: string;
  userName?: string | null;
  expiresText?: string;
  fileName?: string;
  supportEmail?: string;
}) {
  const {
    downloadUrl,
    productTitle,
    siteUrl,
    userName,
    expiresText = "24 hours",
    fileName,
    supportEmail = "support@workflowkits.com",
  } = opts;

  const brand = {
    bg: "#0b1020",
    accent: "#00c2ff",
    text: "#0f172a",
    sub: "#475569",
    border: "#e2e8f0",
  };

  return `<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="color-scheme" content="light only" />
  <title>Your WorkflowKits download</title>
</head>
<body style="margin:0;padding:0;background:#f6f7fb;color:${brand.text};
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,'Apple Color Emoji','Segoe UI Emoji'">
  <!-- Top bar -->
  <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="background:${brand.bg};padding:16px 24px">
    <tr>
      <td width="48"><a href="${siteUrl}" style="display:inline-block">
        <img src="${siteUrl}/logo.png" alt="WorkflowKits" width="40" height="40" style="border-radius:8px;display:block" />
      </a></td>
      <td><a href="${siteUrl}" style="color:#fff;font-size:18px;font-weight:700;text-decoration:none">WorkflowKits</a></td>
    </tr>
  </table>

  <!-- Card -->
  <table width="100%" cellspacing="0" cellpadding="0" role="presentation">
    <tr><td align="center" style="padding:24px">
      <table width="560" cellspacing="0" cellpadding="0" role="presentation" style="max-width:560px;background:#fff;border:1px solid ${brand.border};border-radius:14px;box-shadow:0 8px 24px rgba(2,6,23,.06);padding:24px">
        <tr><td>
          <p style="margin:0;font-size:16px;color:${brand.sub}">${userName ? `Hi ${userName},` : "Hi,"}</p>
          <p style="margin:8px 0 0;font-size:18px;line-height:1.5">
            Your download link for <strong>${productTitle}</strong> is ready.
          </p>

          ${fileName ? `
          <hr style="border:none;border-top:1px solid ${brand.border};margin:18px 0" />
          <p style="margin:0 0 6px 0;color:${brand.sub};font-size:12px">File</p>
          <p style="margin:0;font-size:14px;font-weight:600">${fileName}</p>
          ` : ""}

          <div style="padding-top:18px">
            <a href="${downloadUrl}" target="_blank" rel="noopener"
              style="display:inline-block;background:${brand.accent};color:#001018;font-weight:700;
              padding:12px 18px;border-radius:12px;text-decoration:none;border:0">Download now</a>
            <p style="font-size:12px;color:${brand.sub};margin-top:14px;line-height:1.6">
              Link expires in ${expiresText}. If the button doesn’t work, copy and paste this URL:<br />
              <a href="${downloadUrl}" style="color:${brand.accent};text-decoration:underline;word-break:break-all">
                ${downloadUrl}
              </a>
            </p>
          </div>

          <hr style="border:none;border-top:1px solid ${brand.border};margin:18px 0" />
          <p style="font-size:12px;color:${brand.sub}">
            Need help? Email <a href="mailto:${supportEmail}" style="color:${brand.accent};text-decoration:underline">${supportEmail}</a>.
          </p>
        </td></tr>
      </table>
      <p style="text-align:center;color:${brand.sub};font-size:12px;margin:16px 0 40px">
        © ${new Date().getFullYear()} WorkflowKits · <a href="${siteUrl}" style="color:${brand.accent};text-decoration:underline">workflowkits.com</a>
      </p>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug")?.trim();
  const toOverride = url.searchParams.get("to")?.trim(); // debug only

  if (!slug) return NextResponse.json({ ok: false, error: "Missing slug" }, { status: 400 });
  const filename = FILES[slug];
  if (!filename) return NextResponse.json({ ok: false, error: "Unknown product slug" }, { status: 404 });

  const session = getSession();
  const to = toOverride || session?.email;
  if (!to) return NextResponse.json({ ok: false, error: "Not logged in" }, { status: 401 });

  const secret = process.env.JWT_SECRET;
  if (!secret) return NextResponse.json({ ok: false, error: "Missing JWT_SECRET" }, { status: 500 });

  // Signed token for /api/download
  const token = (await import("jsonwebtoken")).default.sign(
    { slug, filename },
    secret,
    { expiresIn: "24h" }
  );

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${url.protocol}//${url.host}`;
  const downloadUrl = `${siteUrl}/api/download?token=${encodeURIComponent(token)}`;
  const productTitle = titleFromSlug(slug);
  const from = process.env.RESEND_FROM;
  if (!from) return NextResponse.json({ ok: false, error: "Missing RESEND_FROM" }, { status: 500 });

  const html = renderDownloadEmailHTML({
    downloadUrl,
    productTitle,
    siteUrl,
    userName: session?.email?.split("@")[0] || null,
    fileName: filename,
    supportEmail: "support@workflowkits.com",
  });

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: `Your WorkflowKits download: ${productTitle}`,
      html,
    });
    if (error) return NextResponse.json({ ok: false, error }, { status: 500 });
    return NextResponse.json({ ok: true, id: data?.id, to, slug, downloadUrl });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Send failed" }, { status: 500 });
  }
}
