// app/api/free-download/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createReadStream, statSync } from "fs";
import path from "path";

// If you prefer, you can use your loadProducts() helper instead
import products from "@/data/products.json";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const slug = (url.searchParams.get("slug") || "").trim();

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const product = (products as any[]).find((p) => p.slug === slug);

  if (!product || !product.file) {
    return NextResponse.json({ error: "Unknown slug or file missing" }, { status: 404 });
  }

  const fileRef: string = product.file;

  // 1) PUBLIC FILES (e.g., /public/downloads/...)  -> redirect with ABSOLUTE URL
  if (fileRef.startsWith("/")) {
    // Build an absolute URL based on the request origin
    const absolute = new URL(fileRef, url.origin); // <- fixes the “relative URL” error
    return NextResponse.redirect(absolute.toString(), { status: 302 });
  }

  // 2) PRIVATE/LOCAL FILES (e.g., a plain filename in /data/download)
  //    Stream the file from the filesystem
  try {
    const filePath = path.join(process.cwd(), "data", "download", fileRef);
    const stat = statSync(filePath);
    const stream = createReadStream(filePath);

    const lower = fileRef.toLowerCase();
    const contentType =
      lower.endsWith(".pdf")
        ? "application/pdf"
        : lower.endsWith(".docx")
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : lower.endsWith(".zip")
        ? "application/zip"
        : "application/octet-stream";

    return new NextResponse(stream as any, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(stat.size),
        "Content-Disposition": `attachment; filename="${path.basename(fileRef)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: "File not found", detail: e?.message }, { status: 404 });
  }
}
