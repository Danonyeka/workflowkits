// app/api/download/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createReadStream, statSync } from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs"; // fs requires Node runtime

// If you want to support ?slug=<slug> fallback, map it here.
const FILES: Record<string, string> = {
  "project-charter-template": "project-charter-template.docx",
  "project-execution-plan": "project-execution-plan.docx",
  "lessons-learned-journal": "lessons-learned-journal.pdf",
  // add others...
};

function contentTypeByExt(filename: string) {
  const ext = filename.toLowerCase().split(".").pop() || "";
  switch (ext) {
    case "pdf":
      return "application/pdf";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "pptx":
      return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    case "zip":
      return "application/zip";
    default:
      return "application/octet-stream";
  }
}

/**
 * Normalizes a user input path to a single filename (no traversal).
 * Accepts "download/foo.docx" or "foo.docx" and returns "foo.docx".
 */
function normalizeFilename(input: string) {
  let rel = (input || "").trim().replace(/^\/+/, "");
  // Strip optional leading directory we used previously
  rel = rel.replace(/^download\//, "");
  // Block traversal
  if (!rel || rel.includes("..") || rel.includes("/") || rel.includes("\\")) return null;
  return rel;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);

  // 1) Preferred: signed token from emailed link
  const token = url.searchParams.get("token");

  // 2) Optional: direct ?file=filename for testing while logged-in
  const fileParam = url.searchParams.get("file");

  // 3) Optional: ?slug=... (mapped to filename) for convenience
  const slugParam = url.searchParams.get("slug");

  let filename: string | null = null;

  if (token) {
    try {
      const secret = process.env.JWT_SECRET!;
      const payload = jwt.verify(token, secret) as { filename: string; slug?: string };
      filename = normalizeFilename(payload.filename);
      if (!filename) {
        return NextResponse.json({ error: "Bad token payload" }, { status: 400 });
      }
    } catch (e: any) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
  } else if (fileParam) {
    // Require session for raw file param to avoid open downloads
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    filename = normalizeFilename(fileParam);
    if (!filename) {
      return NextResponse.json({ error: "Bad path" }, { status: 400 });
    }
  } else if (slugParam) {
    // Optional convenience: map slug to file but still require session
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const mapped = FILES[slugParam];
    filename = normalizeFilename(mapped || "");
    if (!filename) {
      return NextResponse.json({ error: "Unknown slug" }, { status: 400 });
    }
  } else {
    return NextResponse.json({ error: "Missing token or file/slug" }, { status: 400 });
  }

  // Resolve into data/download/<filename>
  const filePath = path.join(process.cwd(), "data", "download", filename);

  try {
    const stat = statSync(filePath);
    const stream = createReadStream(filePath);

    return new NextResponse(stream as any, {
      headers: {
        "Content-Type": contentTypeByExt(filename),
        "Content-Length": String(stat.size),
        "Content-Disposition": `attachment; filename="${path.basename(filePath)}"`,
        "Cache-Control": "no-store",
        // helps with some proxies
        "X-Accel-Buffering": "no",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "File not found", detail: e?.message },
      { status: 404 }
    );
  }
}
