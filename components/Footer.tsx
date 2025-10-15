// components/Footer.tsx
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-300 bg-gray-100/95">
      <div className="container py-8 grid gap-6 text-sm text-gray-700 sm:grid-cols-2 lg:grid-cols-3">
        {/* Brand & copy */}
        <section>
          <div className="font-semibold text-gray-900">WorkflowKits</div>
          <p className="mt-1">© {new Date().getFullYear()} WorkflowKits.com — Instant digital downloads.</p>
          <p className="mt-2 text-xs text-gray-500">
            Templates, journals, e-books, tools & trackers for faster delivery.
          </p>
        </section>

        {/* Quick links */}
        <nav aria-label="Footer navigation" className="space-y-2">
          <div className="font-medium text-gray-900">Explore</div>
          <div className="grid grid-cols-2 gap-2">
            <Link className="hover:text-brand" href="/">Home</Link>
            <Link className="hover:text-brand" href="/blog">Blog</Link>
            <Link className="hover:text-brand" href="/catalog">Catalog</Link>
            <Link className="hover:text-brand" href="/categories/Templates">Templates</Link>
            <Link className="hover:text-brand" href="/categories/Journals">Journals</Link>
            <Link className="hover:text-brand" href="/categories/E-Books">E-Books</Link>
            <Link className="hover:text-brand" href="/categories/Tools">Tools</Link>
            <Link className="hover:text-brand" href="/cart">Cart</Link>
          </div>
        </nav>

        {/* Status / payments */}
        <section className="space-y-2">
          <div className="font-medium text-gray-900">Status & Payments</div>
          <div>Secure checkout with Paystack (NGN)</div>
          <div className="text-xs text-gray-500">
            Files are available for instant download after a successful payment.
          </div>
          <div className="mt-2">
            <span className="inline-block rounded-full bg-brand/10 text-brand px-2.5 py-1 text-xs">
              Live • Online
            </span>
          </div>
        </section>
      </div>

      {/* Sub-footer */}
      <div className="border-t border-gray-300">
        <div className="container py-4 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600">
          <div>Built with Next.js • Styled with Tailwind • Paystack payments</div>
          <div className="flex items-center gap-4">
            <Link className="hover:text-brand" href="/privacy">Privacy</Link>
            <Link className="hover:text-brand" href="/terms">Terms</Link>
            <Link className="hover:text-brand" href="/contact">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
