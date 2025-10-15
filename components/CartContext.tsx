"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = { slug: string; title: string; price: number; cover: string; qty: number };
type CartCtx = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (slug: string) => void;
  clear: () => void;
  count: number;
  total: number;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("wk_cart");
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("wk_cart", JSON.stringify(items));
    } catch {}
  }, [items]);

  const addItem = (item: Omit<CartItem, "qty">, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((p) => p.slug === item.slug);
      if (found) return prev.map((p) => (p.slug === item.slug ? { ...p, qty: p.qty + qty } : p));
      return [...prev, { ...item, qty }];
    });
  };
  const removeItem = (slug: string) => setItems((prev) => prev.filter((p) => p.slug !== slug));
  const clear = () => setItems([]);

  const count = items.reduce((n, p) => n + p.qty, 0);
  const total = items.reduce((n, p) => n + p.price * p.qty, 0);

  const value = useMemo(() => ({ items, addItem, removeItem, clear, count, total }), [items, count, total]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
