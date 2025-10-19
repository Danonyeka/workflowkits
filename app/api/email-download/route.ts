// app/api/email-download/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getSessionEmail } from "@/lib/auth";
import products from "@/data/products.json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const slug = (url.searchParams.get("slug") || "").trim();
  const toOverride = url.searchParams.get("to");

  if (!slug) {
    return NextResponse.json({ ok: false, error: "Missing slug" }, { status: 400 });
  }

  const to = toOverride || getSessionEmail();
  if (!to) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL || `${url.protocol}//${url.host}`;
  const product = (products as any[]).find((p) => p.slug === slug);
  if (!product) {
    return NextResponse.json({ ok: false, error: "Unknown product slug" }, { status: 404 });
  }

  const fileRef: string | undefined = product.file || product.downloadFile;
  const link =
    fileRef && fileRef.startsWith("/")
      ? new URL(fileRef, site).toString()
      : `${site}/api/free-download?slug=${encodeURIComponent(slug)}`;

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
      html: `<p>Here is your download link:</p><p><a href="${link}">${link}</a></p><p>Thanks!</p>`,
    });

    if (error) {
      // Log the full error so you can inspect in Vercel → Functions → Logs
      console.error("Resend error:", JSON.stringify(error));
      const msg = (error as any)?.message || "Email send failed";
      return NextResponse.json({ ok: false, to, slug, link, error: msg }, { status: 500 });
    }

    return NextResponse.json({ ok: true, to, slug, link, id: data?.id || null });
  } catch (e: any) {
    console.error("EMAIL-DOWNLOAD exception:", e);
    return NextResponse.json(
      { ok: false, to, slug, link, error: e?.message || "Send failed" },
      { status: 500 }
    );
  }
}
