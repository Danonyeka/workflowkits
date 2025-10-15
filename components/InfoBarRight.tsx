"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Rotating highlights (replace with your own promos/ads later)
const ROTATORS = [
  { title: "Instant Downloads", body: "Get files immediately after payment.", href: "/catalog" },
  { title: "Secure Paystack", body: "NGN payments with bank cards & transfers." },
  { title: "Popular: Risk Register", body: "Best-seller for stakeholder reviews.", href: "/products/project-risk-register-pro" },
];

export default function InfoBarRight() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % ROTATORS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const r = ROTATORS[i];

  return (
    <aside
      role="complementary"
      aria-label="Highlights and promotions"
      className="hidden md:block fixed right-0 top-24 h-[calc(100vh-6rem)] w-64 border-l bg-gray-100/80 backdrop-blur z-30 overflow-y-auto"
    >
      {/* Header */}
      <div className="p-4 border-b">
        <div className="text-sm text-gray-500">Highlights</div>
      </div>

      <div className="p-4 space-y-4">
        {/* Rotating highlight */}
        <div className="surface p-4">
          <div className="text-sm text-brand font-semibold">{r.title}</div>
          <div className="text-sm text-gray-600 mt-1">{r.body}</div>
          {r.href && (
            <Link href={r.href} className="inline-block mt-3 text-sm underline">
              Learn more
            </Link>
          )}
        </div>

        {/* Static promo blocks */}
        <div className="surface p-4">
          <div className="text-sm font-semibold">Weekly Deal</div>
          <div className="text-sm text-gray-600 mt-1">Save 15% on Journals (Fri–Sun)</div>
        </div>

        <div className="surface p-4">
          <div className="text-sm font-semibold">New: SOPs Pack</div>
          <div className="text-sm text-gray-600 mt-1">Editable Word + Process diagrams</div>
          <Link href="/products/sops-for-admin-ops" className="inline-block mt-3 text-sm underline">
            View product
          </Link>
        </div>

        {/* Ad slot placeholder */}
        <div className="surface p-0 overflow-hidden">
          <div className="px-4 py-2 text-xs text-gray-500 border-b">Sponsored</div>
          <div className="p-3">
            <div className="h-24 bg-gray-50 rounded flex items-center justify-center text-xs text-gray-500">
              Ad space (300×250)
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
