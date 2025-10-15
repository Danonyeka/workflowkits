import "./globals.css";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/components/CartContext";
import InfoBarRight from "@/components/InfoBarRight";
import TopMarquee from "@/components/TopMarquee";

export const metadata: Metadata = {
  title: "WorkflowKits — Project, Construction & Admin Templates",
  description: "Instant digital downloads: templates, journals, e-books, tools.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    title: "WorkflowKits",
    description: "Templates, journals, e-books, tools — instant downloads",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: "WorkflowKits",
    type: "website",
  },
  robots: "index,follow",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          {/* Brand-colored marquee above the header */}
          <TopMarquee />
          {/* Right info bar sits below marquee+header (handled inside component with top-24) */}
          <InfoBarRight />

          {/* Column layout: reserve right space on md+, pad top for marquee+fixed header */}
          <div className="flex min-h-screen flex-col md:pr-64">
            <Header />
            {/* 6rem = 2rem marquee + 4rem header */}
            <main className="container flex-1 pt-24 pb-10">{children}</main>
            <Footer />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
