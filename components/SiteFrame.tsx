"use client";
import "@/app/globals.css";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
export default function SiteFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const fullWidth = pathname === "/" || pathname.startsWith("/business-software");
  return <div className="site-frame"><Header /><main id="main-content" className={fullWidth ? "site-main" : "site-main container content-main"}>{children}</main><Footer /></div>;
}
