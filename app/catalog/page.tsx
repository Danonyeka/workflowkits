// app/catalog/page.tsx
import { loadProducts } from "@/lib/loadProducts";
import { ProductCard } from "@/components/ProductCard";

const products = loadProducts() as any[];

export default function CatalogPage() {
  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto px-4">
      <header className="text-center space-y-1">
        <h1 className="text-3xl font-semibold">All Products</h1>
        <p className="text-gray-600">Browse every template, journal, e-book, and tool.</p>
      </header>

      {/* Auto-fit keeps rows balanced and centered across breakpoints */}
      <section className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
        {products.map((p) => (
          <ProductCard key={p.slug} product={p as any} />
        ))}
      </section>
    </div>
  );
}
