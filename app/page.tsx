import Link from "next/link";
import { loadProducts } from "@/lib/loadProducts";
const products = loadProducts() as any[];
import { CategoryNav } from "@/components/CategoryNav";
import { ProductCard } from "@/components/ProductCard";

export default function Home() {
  const featured = products.slice(0, 4);
  return (
    <div className="space-y-10">
      <section className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-bold">Save Time. Reduce Errors. Improve Outcomes.</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Comprehensive journals, trackers, checklists, templates and e-books — empowering teams to stay organized and deliver results without delays.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/categories/Templates" className="brand-btn">Browse Templates</Link>
          <Link href="/catalog" className="px-5 py-3 border rounded-xl hover:bg-gray-50">View Full Catalog</Link>
        </div>
      </section>

      <CategoryNav />

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {featured.map((p) => (
          <ProductCard key={p.slug} product={p as any} />
        ))}
      </section>

      <section className="rounded-2xl bg-gray-50 p-6">
        <h2 className="text-2xl font-semibold mb-2">What Readers say</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {featured.flatMap((p: any) => p.testimonials || []).slice(0,3).map((t, i) => (
            <blockquote key={i} className="p-4 bg-white rounded-xl shadow-sm">
              <p className="italic">“{t.text}”</p>
              <div className="mt-2 text-sm text-gray-500">— {t.name}</div>
            </blockquote>
          ))}
        </div>
      </section>
      
        <section className="surface p-8 sm:p-10 text-center space-y-4">
          <h1 className="h1">Build faster with proven templates</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
              Project management templates (Excel, Word, Google Sheets), construction checklists,
             journals, reports, e-books, SOPs, and admin trackers — with instant digital downloads.
         </p>
         <div className="flex items-center justify-center gap-3">
            <a href="/categories/Templates" className="brand-btn">Browse Templates</a>
            <a href="/catalog" className="ghost-btn">View Full Catalog</a>
          </div>
        </section>
    </div>
  );
}
