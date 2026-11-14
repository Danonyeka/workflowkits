// app/login/page.tsx
import { Suspense } from "react";
import LoginClient from "./LoginClient";

export const dynamic = "force-dynamic"; // avoid static prerender issues
export const metadata = { title: "Sign in | WorkflowKits", robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginClient />
    </Suspense>
  );
}
