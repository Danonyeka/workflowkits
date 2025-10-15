// app/sitemap.xml/route.ts
import { NextResponse } from "next/server";
import { loadProducts } from "@/lib/loadProducts";

export const runtime = "nodejs";

export async function GET() {
  const products = (loadProducts() as any[]) || [];

  const urls = [
    "/",
    "/catalog",
    "/categories/Journals",
    "/categories/E-Books",
    "/categories/Tools",
    // ✅ spread, not *
    ...products.map((p: any) => `/products/${p.slug}`),
  ];

  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `<url><loc>${base.replace(/\/$/, "")}${u}</loc><changefreq>weekly</changefreq></url>`
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(xml, { headers: { "Content-Type": "application/xml" } });
}
