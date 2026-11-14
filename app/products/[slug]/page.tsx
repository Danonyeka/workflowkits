// app/products/[slug]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { loadProducts } from "@/lib/loadProducts";
import Reviews from "@/components/Reviews";
import DownloadCTA from "@/components/DownloadCTA";  // <-- import the client component
import { notFound } from "next/navigation";
export function generateMetadata({ params }: { params: { slug: string } }) {
  const product = loadProducts().find((item: any) => item.slug === params.slug);
  return product ? { title: `${product.title} | WorkflowKits`, description: String(product.short || "").replace(/\*\*/g, ""), alternates: { canonical: `https://workflowkits.com/products/${product.slug}` } } : { title: "Resource not found | WorkflowKits", robots: { index: false } };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const products = loadProducts() as any[];
  const product = products.find((p) => p.slug === params.slug);

  if (!product) return notFound();

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Media / cover */}
      <div className="surface p-6">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-50">
          <Image src={product.cover} alt={product.title} fill className="object-contain" />
        </div>
      </div>

      {/* Details */}
      <div className="space-y-5">
        <h1 className="h2">{product.title}</h1>
        <p className="text-gray-600">{String(product.short || "").replace(/\*\*/g, "")}</p>

        <ul className="list-disc pl-5 space-y-2 text-gray-700">
  {product.features?.map((f: any, i: number) => {
    if (typeof f === "string") {
      return <li key={i}>{f}</li>;
    }
    // { strong: string, rest?: string }
    return (
      <li key={i}>
        <span className="font-semibold">{f.strong}</span>
        {f.rest ? <> — {f.rest}</> : null}
      </li>
    );
  })}
</ul>

        {/* Download (client) + Back */}
        <div className="flex flex-wrap gap-3">
          {product.slug === "project-status-report-tepmplate" ? <p className="rounded-lg border border-cyan-200 bg-cyan-50 p-4 text-sm">The download file for this resource is being prepared. <Link className="underline" href="/contact">Contact us for help</Link> or browse the available resources.</p> : <DownloadCTA slug={product.slug} />}
          <Link href="/catalog" className="ghost-btn" aria-label="Back to catalog">Back</Link>
        </div>

        <div className="surface p-4">
          <Reviews slug={product.slug} testimonials={product.testimonials || []} />
        </div>
      </div>
    </div>
  );
}
