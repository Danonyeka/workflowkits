"use client";

import { useCart } from "./CartContext";

export default function AddToCartButton({ product }: { product: any }) {
  const { addItem } = useCart();
  return (
    <button
      onClick={() => addItem({ slug: product.slug, title: product.title, price: product.price, cover: product.cover }, 1)}
      className="px-5 py-3 border rounded-xl hover:bg-gray-50"
    >
      Add to Cart
    </button>
  );
}
