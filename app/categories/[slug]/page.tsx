import { loadProducts } from "@/lib/loadProducts";
const products = loadProducts() as any[];
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import Link from "next/link";

const valid = new Set(["Templates","Journals","E-Books","Tools"]);
export function generateMetadata({ params }: { params: { slug: string } }) {
  const category = decodeURIComponent(params.slug);
  return { title: `${category} | WorkflowKits`, description: `Explore ${category.toLowerCase()} in the WorkflowKits resource library.` };
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const cat = decodeURIComponent(params.slug);
  if (!valid.has(cat)) return notFound();
  const list = (products as any[]).filter(p => p.category === cat);
  return (
    <div className="space-y-6">
      <header className="page-heading"><p className="eyebrow">THE RESOURCE LIBRARY</p><h1>{cat}</h1><p>Explore the {cat.toLowerCase()} collection. Review a resource’s details and sign in to request its download link.</p><Link className="text-link inline-block mt-5" href="/catalog">← All resources</Link></header>
      {list.length === 0 && <div className="empty-state"><h2 className="h2">More resources are on the way.</h2><p className="mt-3 mb-5">There are no published resources in this category yet. Explore the rest of the library in the meantime.</p><Link className="brand-btn" href="/catalog">Browse available resources →</Link></div>}
      <div className="resource-grid">
        {list.map((p) => <ProductCard key={p.slug} product={p as any} />)}
      </div>
    </div>
  );
}
