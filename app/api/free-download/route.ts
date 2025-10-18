// app/api/free-download/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createReadStream, statSync } from "fs";
import path from "path";
import { getSession } from "@/lib/session";
import { Resend } from "resend";

export const runtime = "nodejs";

// Map slugs -> filenames under /data/download
const FILES: Record<string, string> = {
  "project-charter-template": "project_charter_template.docx",
  "project-execution-plan": "project-execution-plan.docx",
  "lessons-learned-journal": "lessons-learned-journal.pdf",
  "sops-for-admin-ops": "admin-sops.docx",
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const slug = (url.searchParams.get("slug") || "").trim();
  const next = url.searchParams.get("next") || `/products/${slug}`;

  // 1) Auth gate
  const session = getSession(req);
  if (!session) {
    // Hard redirect to register with ?next=<current>
    return NextResponse.redirect(
      new URL(`/register?next=${encodeURIComponent(next)}`, url),
      302
    );
  }

  // 2) Guard slug
  const filename = FILES[slug];
  if (!slug || !filename) {
    return NextResponse.json({ error: "Unknown or missing slug" }, { status: 400 });
  }

  // 3) Email the user a link (fire-and-forget best effort)
  try {
    if (process.env.RESEND_API_KEY && process.env.RESEND_FROM) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const site = process.env.NEXT_PUBLIC_SITE_URL || `${url.protocol}//${url.host}`;
      const link = `${site}/api/free-download?slug=${encodeURIComponent(slug)}&next=${encodeURIComponent(next)}`;
      await resend.emails.send({
        from: process.env.RESEND_FROM!,
        to: session.email,
        subject: "Your download from WorkflowKits",
        html: `<p>Hi,</p>
               <p>You requested <strong>${slug}</strong>. If you ever need it again, you can download it here:</p>
               <p><a href="${link}">${link}</a></p>
               <p>Thanks!</p>`,
      });
    }
  } catch {
    // don't block the download if email fails
  }

  // 4) Stream the file
  const filePath = path.join(process.cwd(), "data", "download", filename);
  try {
    const stat = statSync(filePath);
    const stream = createReadStream(filePath);

    const contentType = filename.toLowerCase().endsWith(".docx")
      ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      : filename.toLowerCase().endsWith(".pdf")
      ? "application/pdf"
      : "application/octet-stream";

    return new NextResponse(stream as any, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(stat.size),
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "File not found", detail: e?.message },
      { status: 404 }
    );
  }
}
