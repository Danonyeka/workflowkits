// app/products/[slug]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { loadProducts } from "@/lib/loadProducts";
import Reviews from "@/components/Reviews";
import DownloadCTA from "@/components/DownloadCTA";  // <-- import the client component

export default function ProductPage({ params }: { params: { slug: string } }) {
  const products = loadProducts() as any[];
  const product = products.find((p) => p.slug === params.slug);

  if (!product) return <div className="container py-10">Product not found</div>;

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
        <p className="text-gray-600">{product.short}</p>

        <ul className="list-disc pl-5 text-gray-700">
          {product.features?.map((f: string, i: number) => <li key={i}>{f}</li>)}
        </ul>

        {/* Download (client) + Back */}
        <div className="flex flex-wrap gap-3">
          <DownloadCTA slug={product.slug} />   {/* <-- only this renders the button */}
          <Link href="/catalog" className="ghost-btn" aria-label="Back to catalog">Back</Link>
        </div>

        <div className="surface p-4">
          <Reviews slug={product.slug} testimonials={product.testimonials || []} />
        </div>
      </div>
    </div>
  );
}
