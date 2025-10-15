import fs from "fs";
import path from "path";
import fallback from "@/data/products.json";

export function loadProducts() {
  try {
    const p = path.join(process.cwd(), "data", "products.json");
    if (fs.existsSync(p)) {
      const txt = fs.readFileSync(p, "utf-8");
      return JSON.parse(txt);
    }
  } catch {}
  return fallback;
}
