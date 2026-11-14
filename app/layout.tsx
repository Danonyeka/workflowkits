import type { Metadata } from "next";
import { CartProvider } from "@/components/CartContext";
import SiteFrame from "@/components/SiteFrame";

export const metadata: Metadata = {
  title: "WorkflowKits | Practical Resources & Business Software",
  description: "Templates, journals, project tools and WDT business software. Find a clearer starting point for your projects and everyday business operations.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://workflowkits.com"),
  openGraph: {
    title: "WorkflowKits",
    description: "Practical resources and business software for the work ahead.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://workflowkits.com",
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
          <SiteFrame>{children}</SiteFrame>
        </CartProvider>
      </body>
    </html>
  );
}
