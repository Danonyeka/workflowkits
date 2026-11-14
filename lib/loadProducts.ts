import fs from "fs";
import path from "path";
import fallback from "@/data/products.json";

function prepareProducts(products: any[]) {
  const seen = new Set<string>();
  return products.filter((product) => {
    if (!product?.slug || seen.has(product.slug)) return false;
    seen.add(product.slug); return true;
  }).map((product) => ({
    ...product,
    category: product.category === "Template" ? "Templates" : product.category,
    cover: typeof product.cover === "string" && product.cover.startsWith("/images/") && !product.cover.includes("..") && fs.existsSync(path.join(process.cwd(), "public", product.cover)) ? product.cover : "/images/resource-placeholder.svg",
  }));
}
export function loadProducts() {
  try {
    const p = path.join(process.cwd(), "data", "products.json");
    if (fs.existsSync(p)) {
      const txt = fs.readFileSync(p, "utf-8");
      const products = JSON.parse(txt);
      if (Array.isArray(products)) return prepareProducts(products);
    }
  } catch {}
  return prepareProducts(fallback);
}
