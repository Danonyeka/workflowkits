"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartContext";

export default function CartPage() {
  const { items, total, removeItem, clear } = useCart();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Your Cart</h1>

      {items.length === 0 ? (
        <div className="p-6 border rounded-xl">
          Your cart is empty. <Link className="underline" href="/catalog">Browse the catalog</Link>.
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((it) => (
              <div key={it.slug} className="flex items-center gap-3 p-3 border rounded-xl">
                <div className="relative h-16 w-20 bg-gray-50 rounded">
                  <Image src={it.cover} alt={it.title} fill className="object-contain" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{it.title}</div>
                  <div className="text-sm text-gray-600">₦{it.price.toLocaleString()} × {it.qty}</div>
                </div>
                <button onClick={() => removeItem(it.slug)} className="text-sm text-red-600">Remove</button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between p-4 border rounded-xl">
            <div className="text-lg font-semibold">Total: ₦{total.toLocaleString()}</div>
            <div className="flex gap-3">
              <button onClick={clear} className="px-4 py-2 border rounded-xl">Clear</button>
              <Link href="/catalog" className="px-4 py-2 border rounded-xl">Continue Shopping</Link>
              {/* For now, direct checkout is still per-product. */}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
