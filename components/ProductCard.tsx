import Image from "next/image";
import Link from "next/link";
export function ProductCard({ product }: { product: any }) {
  return <article className="resource-card"><Link href={`/products/${product.slug}`} className="resource-media" tabIndex={-1} aria-hidden="true"><Image src={product.cover} alt="" fill className="object-contain" sizes="(min-width: 1100px) 340px, (min-width: 700px) 45vw, 90vw" /></Link><div className="resource-card-body"><span className="resource-category">{product.category}</span><h3><Link href={`/products/${product.slug}`}>{product.title}</Link></h3><p>{String(product.short || "").replace(/\*\*/g, "")}</p><Link className="resource-card-link" href={`/products/${product.slug}`} aria-label={`View ${product.title}`}>View resource <span aria-hidden="true">↗</span></Link></div></article>;
}
