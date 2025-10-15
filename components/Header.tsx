// components/Header.tsx
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";

const CartBadge = dynamic(() => import("./CartBadge"), { ssr: false });
const AuthLinks = dynamic(() => import("./AuthLinks"), { ssr: false });

export function Header() {
  return (
    <header className="fixed inset-x-0 top-8 z-50 border-b border-gray-300 bg-gray-100/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="WorkflowKits"
            width={56}
            height={56}
            priority
            className="h-12 w-auto object-contain"
            sizes="56px"
          />
          <span className="font-semibold text-lg md:text-xl">WorkflowKits</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link className="hover:text-brand" href="/">Home</Link>
          <Link className="hover:text-brand" href="/blog">Blog</Link>
          <Link className="hover:text-brand" href="/categories/Templates">Templates</Link>
          <Link className="hover:text-brand" href="/categories/Journals">Journals</Link>
          <Link className="hover:text-brand" href="/categories/E-Books">E-Books</Link>
          <Link className="hover:text-brand" href="/categories/Tools">Tools</Link>
          <Link className="hover:text-brand" href="/cart">
            Cart <CartBadge />
          </Link>

          {/* Auth: Sign in / Register / Logout */}
          <div className="ml-3 pl-3 border-l border-gray-300">
            <AuthLinks />
          </div>
        </nav>
      </div>
    </header>
  );
}
