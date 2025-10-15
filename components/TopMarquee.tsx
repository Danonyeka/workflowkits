"use client";

import Link from "next/link";

const items = [
  { text: "Instant digital downloads", href: "/catalog" },
  { text: "Secure Paystack checkout (NGN)" },
  { text: "New: SOPs Pack", href: "/products/sops-for-admin-ops" },
  { text: "Weekly Deal: -15% on Journals (Fri–Sun)", href: "/categories/Journals" },
];

export default function TopMarquee() {
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-8 bg-brand text-white">
      <div className="h-full overflow-hidden">
        {/* Two copies for seamless loop */}
        <div className="marquee h-full flex items-center gap-8 whitespace-nowrap px-4">
          {items.concat(items).map((it, i) =>
            it.href ? (
              <Link key={i} href={it.href} className="text-xs hover:underline">
                {it.text}
              </Link>
            ) : (
              <span key={i} className="text-xs">
                {it.text}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}
