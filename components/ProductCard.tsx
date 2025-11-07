import Image from "next/image";
import Link from "next/link";

export function ProductCard({ product }: { product: any }) {
  return (
    <div className="surface w-full h-full flex flex-col overflow-hidden transition-shadow hover:shadow-hover">
      {/* Aspect-ratio keeps thumbnails consistent across rows */}
      <div className="relative aspect-[4/3] bg-gray-50">
        <Image
          src={product.cover}
          alt={product.title}
          fill
          className="object-contain"
          sizes="(min-width: 1280px) 320px, (min-width: 768px) 260px, 100vw"
        />
      </div>

      {/* Make body take remaining height so the footer sits at the bottom */}
      <div className="p-4 flex-1 flex flex-col gap-2">
        <Link
          href={`/products/${product.slug}`}
          className="font-semibold hover:text-brand line-clamp-2"
        >
          {product.title}
        </Link>

        <p className="text-sm text-gray-600 line-clamp-2">{product.short}</p>

        <div className="mt-auto flex items-center justify-end pt-2">
          <Link href={`/products/${product.slug}`} className="text-sm ghost-btn">
            View
          </Link>
        </div>
      </div>
    </div>
  );
}
