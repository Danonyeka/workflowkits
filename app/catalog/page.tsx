import Link from "next/link";
import { loadProducts } from "@/lib/loadProducts";
import { ProductCard } from "@/components/ProductCard";
export const metadata = { title: "Resource Library | WorkflowKits", description: "Explore WorkflowKits templates, journals and tools for projects and business operations.", alternates: { canonical: "https://workflowkits.com/catalog" } };
export default function CatalogPage() {
  const products = loadProducts();
  return <><header className="page-heading"><p className="eyebrow">A BETTER STARTING POINT</p><h1>The resource library.</h1><p>Browse templates, journals and tools. Check the resource details, then sign in to request your download link.</p><nav aria-label="Filter by category" className="catalog-categories">{["Templates", "Journals", "E-Books", "Tools"].map((category) => <Link key={category} href={`/categories/${category}`}>{category}</Link>)}</nav></header><section className="resource-grid" aria-label="Available resources">{products.map((product: any) => <ProductCard key={product.slug} product={product} />)}</section></>;
}
