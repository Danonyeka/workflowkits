// app/api/email-download/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getSessionEmail } from "@/lib/auth";
import products from "@/data/products.json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // read cookies at request time
export const revalidate = 0;

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const slug = (url.searchParams.get("slug") || "").trim();
  const toOverride = url.searchParams.get("to"); // optional test hook

  if (!slug) {
    return NextResponse.json({ ok: false, error: "Missing slug" }, { status: 400 });
  }

  // --- resolve recipient from session (or ?to= for tests) ---
  const to = toOverride || getSessionEmail();
  if (!to) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  // --- resolve the product's download target ---
  const site = process.env.NEXT_PUBLIC_SITE_URL || `${url.protocol}//${url.host}`;
  const product = (products as any[]).find((p) => p.slug === slug);

  if (!product) {
    return NextResponse.json({ ok: false, error: "Unknown product slug" }, { status: 404 });
  }

  // Prefer explicit `file` (public path in /public), otherwise fall back to gated API
  // Supports either:  product.file  OR  product.downloadFile  (your older field)
  const fileRef: string | undefined = product.file || product.downloadFile;

  // Build the link we’ll email:
  // - If fileRef starts with "/" → public file under /public (absolute URL)
  // - Else fall back to gated API route you control (no file path leakage)
  const link =
    fileRef && fileRef.startsWith("/")
      ? new URL(fileRef, site).toString()
      : `${site}/api/free-download?slug=${encodeURIComponent(slug)}`;

  // --- send the email ---
  try {
    const from = process.env.RESEND_FROM;
    if (!from) {
      return NextResponse.json(
        { ok: false, error: "Email not configured (RESEND_FROM missing)" },
        { status: 500 }
      );
    }

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: `Your WorkflowKits download: ${product.title || slug}`,
      text: `Here is your download link:\n${link}\n\nThis link goes to your file on workflowkits.com.`,
      html: `
        <div style="font-family:ui-sans-serif,system-ui,Segoe UI,Arial">
          <p>Here is your download link:</p>
          <p><a href="${link}" target="_blank" rel="noopener">${link}</a></p>
          <p style="color:#666">If you didn't request this, you can ignore this email.</p>
        </div>
      `,
    });

    // Helpful response for debugging from the client
    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ ok: false, to, slug, link, error }, { status: 500 });
    }

    return NextResponse.json({ ok: true, to, slug, link, id: data?.id || null });
  } catch (e: any) {
    console.error("EMAIL-DOWNLOAD exception:", e);
    return NextResponse.json(
      { ok: false, to, slug, link, message: e?.message || "Send failed" },
      { status: 500 }
    );
  }
}
