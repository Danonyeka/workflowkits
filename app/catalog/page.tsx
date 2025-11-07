import { loadProducts } from "@/lib/loadProducts";
const products = loadProducts() as any[];
import { ProductCard } from "@/components/ProductCard";

export default function CatalogPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">All Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {products.map((p) => <ProductCard key={p.slug} product={p as any} />)}
      </div>
    </div>
  )
}
