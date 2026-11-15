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
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: `(function(){try{var p=localStorage.getItem('wk-appearance');var d=p==='dark'||((p!=='light'&&p!=='dark')&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';document.documentElement.style.colorScheme=d?'dark':'light';}catch(e){document.documentElement.dataset.theme=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}})();` }} /></head>
      <body>
        <CartProvider>
          <SiteFrame>{children}</SiteFrame>
        </CartProvider>
      </body>
    </html>
  );
}
