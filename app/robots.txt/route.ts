export async function GET() {
  return new Response(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nDisallow: /login\nDisallow: /register\nSitemap: ${(process.env.NEXT_PUBLIC_SITE_URL || "https://workflowkits.com").replace(/\/$/, "")}/sitemap.xml`, {
    headers: { "Content-Type": "text/plain" },
  });
}
