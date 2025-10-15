"use client";
import { useCart } from "./CartContext";

export default function CartBadge() {
  const { count } = useCart();
  if (!count) return null;
  return (
    <span className="ml-2 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-brand text-white text-[10px]">
      {count}
    </span>
  );
}
