import { loadProducts } from "@/lib/loadProducts";
const products = loadProducts() as any[];

export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const urls = [
    "",
    "/catalog",
    "/categories/Templates",
    "/categories/Journals",
    "/categories/E-Books",
    "/categories/Tools",
    *products.map((p:any)=>`/products/${p.slug}`)
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls.map(u => `<url><loc>${base}${u}</loc></url>`).join("")}
  </urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml" } });
}
