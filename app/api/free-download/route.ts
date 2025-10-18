import { NextRequest, NextResponse } from "next/server";
import { createReadStream, statSync } from "fs";
import path from "path";
import jwt from "jsonwebtoken";

export const runtime = "nodejs";

// Map product slug -> filename (put files under data/download)
const FILES: Record<string, string> = {
  "project-charter-template": "project_charter_template.docx",
  "project-execution-plan": "project-execution-plan.docx",
  "lessons-learned-journal": "lessons-learned-journal.pdf",
  "sops-for-admin-ops": "admin-sops.docx",
};

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const slug = (url.searchParams.get("slug") || "").trim();
    const token = url.searchParams.get("token");

    if (!slug || !FILES[slug]) {
      return NextResponse.json({ error: "Unknown or missing slug" }, { status: 400 });
    }
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    // Verify signed token
    const secret = process.env.JWT_SECRET!;
    try {
      const payload = jwt.verify(token, secret) as { slug: string; email: string; iat: number; exp: number };
      if (payload.slug !== slug) {
        return NextResponse.json({ error: "Token mismatch" }, { status: 401 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const filename = FILES[slug];
    const filePath = path.join(process.cwd(), "data", "download", filename);
    const stat = statSync(filePath);
    const stream = createReadStream(filePath);

    const contentType =
      filename.toLowerCase().endsWith(".docx")
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
    return NextResponse.json({ error: "File not found", detail: e?.message }, { status: 404 });
  }
}
