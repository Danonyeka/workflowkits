import { loadProducts } from "@/lib/loadProducts";
const products = loadProducts() as any[];
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";

const valid = new Set(["Templates","Journals","E-Books","Tools"]);

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const cat = decodeURIComponent(params.slug);
  if (!valid.has(cat)) return notFound();
  const list = (products as any[]).filter(p => p.category === cat);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">{cat}</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((p) => <ProductCard key={p.slug} product={p as any} />)}
      </div>
    </div>
  );
}
