// app/api/free-download/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createReadStream, statSync } from "fs";
import path from "path";
import { loadProducts } from "@/lib/loadProducts";

export const runtime = "nodejs";

// (Optional) legacy overrides if you want to force-map a few slugs:
const FILES_OVERRIDE: Record<string, string> = {
  // "project-charter-template": "project_charter_template.docx",
};

const CT: Record<string, string> = {
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".zip": "application/zip",
};

function contentTypeFor(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  return CT[ext] || "application/octet-stream";
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const slug = (url.searchParams.get("slug") || "").trim();

    if (!slug) {
      return NextResponse.json({ ok: false, error: "Unknown or missing slug" }, { status: 400 });
    }

    // 1) Try override first
    let fileRef: string | undefined = FILES_OVERRIDE[slug];

    // 2) Else read from products.json
    if (!fileRef) {
      const products = (loadProducts() as any[]) || [];
      const product = products.find((p) => p.slug === slug);
      if (!product) {
        return NextResponse.json({ ok: false, error: "Product not found" }, { status: 404 });
      }
      fileRef =
        product.file ||
        (Array.isArray(product.files) && product.files.length > 0 ? product.files[0] : undefined);
    }

    if (!fileRef) {
      return NextResponse.json({ ok: false, error: "No file configured for this product" }, { status: 500 });
    }

    // If fileRef starts with '/', treat as /public asset and redirect
    if (fileRef.startsWith("/")) {
      // Example: "/downloads/lessons-learned-journal.pdf"
      return NextResponse.redirect(fileRef);
    }

    // Otherwise stream from /data/download (bundled file path)
    const filename = fileRef;
    const diskPath = path.join(process.cwd(), "data", "download", filename);
    const stat = statSync(diskPath); // throws if not found
    const stream = createReadStream(diskPath);

    return new NextResponse(stream as any, {
      headers: {
        "Content-Type": contentTypeFor(filename),
        "Content-Length": String(stat.size),
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    const msg = e?.code === "ENOENT" ? "File not found on disk" : e?.message || "Download error";
    return NextResponse.json({ ok: false, error: msg }, { status: 404 });
  }
}
