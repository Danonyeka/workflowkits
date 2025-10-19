// app/api/email-download/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import DownloadLinkEmail from "@/emails/DownloadLinkEmail";
import { getSession } from "@/lib/auth"; // your existing session helper

export const runtime = "nodejs";
const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  const toOverride = url.searchParams.get("to"); // debug only

  if (!slug) {
    return NextResponse.json({ ok: false, error: "Missing slug" }, { status: 400 });
  }

  // Build your signed/one-time download URL (you already do this)
  // Example: https://workflowkits.com/api/download?token=...
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://workflowkits.com";
  const downloadUrl = `${siteUrl}/api/download?token=${/* your token here */ "REPLACE_ME"}`;

  // Determine recipient
  const session = getSession();
  const to = toOverride || session?.email;
  if (!to) return NextResponse.json({ ok: false, error: "Not logged in" }, { status: 401 });

  try {
    const productTitle = titleFromSlug(slug); // you can implement this helper if you want

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM!,      // e.g. 'WorkflowKits <noreply@workflowkits.com>'
      to,
      subject: `Your WorkflowKits download: ${productTitle}`,
      react: (
        <DownloadLinkEmail
          downloadUrl={downloadUrl}
          productTitle={productTitle}
          siteUrl={siteUrl}
          userName={session?.email?.split("@")[0]}
          expiresText="24 hours"
          fileName={fileNameFromSlug(slug)} // optional helper
          fileSize={undefined}              // optional
          supportEmail="support@workflowkits.com"
        />
      ),
    });

    if (error) {
      return NextResponse.json({ ok: false, error }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data?.id, to, slug, downloadUrl });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Send failed" },
      { status: 500 }
    );
  }
}

// Optional helpers
function titleFromSlug(slug: string) {
  const map: Record<string, string> = {
    "project-execution-plan": "Project Execution Plan (MS Word)",
    "lessons-learned-journal": "Lessons Learned Journal (PDF)",
    "project-charter-template": "Advanced Project Charter Template",
  };
  return map[slug] || slug.replace(/-/g, " ");
}

function fileNameFromSlug(slug: string) {
  const map: Record<string, string> = {
    "project-execution-plan": "project_execution_plan.docx",
    "lessons-learned-journal": "lessons_learned_journal.pdf",
    "project-charter-template": "project_charter_template.docx",
  };
  return map[slug];
}
