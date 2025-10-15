import Image from "next/image";
import Link from "next/link";

export function ProductCard({ product }: { product: any }) {
  return (
    <div className="surface overflow-hidden transition-shadow hover:shadow-hover h-full">
      {/* Fixed-height media to prevent giant cards */}
      <div className="relative h-56 sm:h-64 md:h-72 bg-gray-50">
        <Image
          src={product.cover}
          alt={product.title}
          fill
          className="object-contain"
        />
      </div>

      <div className="p-4 flex flex-col gap-2">
        <Link
          href={`/products/${product.slug}`}
          className="font-semibold hover:text-brand line-clamp-2"
        >
          {product.title}
        </Link>

        <div className="text-sm text-gray-600 line-clamp-2">{product.short}</div>

        <div className="mt-auto flex items-center justify-end pt-2">
          <Link href={`/products/${product.slug}`} className="text-sm ghost-btn">
            View
          </Link>
        </div>
      </div>
    </div>
  );
}
