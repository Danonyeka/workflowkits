// app/register/page.tsx
import { Suspense } from "react";
import RegisterClient from "./RegisterClient";

export const dynamic = "force-dynamic"; // avoid static prerender issues
export const metadata = { title: "Create a resource account | WorkflowKits", robots: { index: false, follow: false } };

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterClient />
    </Suspense>
  );
}
