// app/api/free-download/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createReadStream, statSync } from "fs";
import path from "path";

export const runtime = "nodejs"; // fs requires Node runtime

// Minimal slug → filename map (extend as you add products)
const FILES: Record<string, string> = {
  // slug: filename in data/download
  "project-charter-template": "project_charter_template.docx",
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const slug = (url.searchParams.get("slug") || "").trim();

  if (!slug || !FILES[slug]) {
    return NextResponse.json({ error: "Unknown or missing slug" }, { status: 400 });
  }

  const filename = FILES[slug];
  const filePath = path.join(process.cwd(), "data", "download", filename);

  try {
    const stat = statSync(filePath);
    const stream = createReadStream(filePath);

    // If you later want hard auth gating, insert your session check here
    // and return NextResponse.redirect(new URL(`/register?next=${url.searchParams.get('next') || '/'}`, url)).

    return new NextResponse(stream as any, {
      headers: {
        "Content-Type":
          filename.toLowerCase().endsWith(".docx")
            ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            : "application/octet-stream",
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
