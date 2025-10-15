# WorkflowKits.com — Next.js Shop (Paystack + Instant Downloads)

A minimal, production-ready starter for selling digital templates with **Paystack** and **instant downloads**.

## Features
- Next.js App Router + Tailwind
- Categories (Templates, Journals, E-Books, Tools)
- Product pages with testimonials
- Paystack Inline checkout
- Server-side verification via `/api/paystack/verify`
- Signed download links via `/api/download` (JWT)
- SEO basics: metadata, robots.txt, sitemap.xml

## Quickstart

```bash
# 1) Install
pnpm i   # or npm i / yarn

# 2) Configure
cp .env.example .env.local
# Fill in:
# NEXT_PUBLIC_SITE_URL=https://workflowkits.com
# NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxxx
# PAYSTACK_SECRET_KEY=sk_live_xxxxx
# JWT_SECRET=change-this

# 3) Run locally
npm run dev
```

## Add / Edit Products
Edit `data/products.json`. Place downloadable files under `public/downloads` and cover images under `public/images/products`.

Fields:
```json
{
  "slug": "construction-rfi-tracker",
  "title": "Construction RFI Tracker (Excel + Google Sheets)",
  "price": 7500,
  "currency": "NGN",
  "category": "Templates",
  "short": "Short description",
  "downloadFile": "/downloads/file.zip",
  "features": ["..."],
  "testimonials": [{"name": "Name", "text": "Review"}],
  "cover": "/images/products/cover.png"
}
```

## How Payments & Downloads Work
1. Customer pays via Paystack Inline on `/checkout/[slug]`
2. Paystack redirects to our callback, where we **verify** the reference in `/api/paystack/verify`
3. On success, we **sign a JWT** with `{ slug, ref }` that expires in 15 minutes.
4. The UI shows a **download button** that hits `/api/download?token=...`
5. The API validates the token and **redirects** to the static file in `/public/downloads`

> For higher security, you can serve files from object storage (e.g., Cloudflare R2/S3) with short-lived signed URLs, or move to a DB for order records and email delivery of links.

## Deploying on Hostinger
- Create a **Node.js app** (>=18) in Hostinger hPanel
- Upload your project (or use Git)
- Install dependencies and run `npm run build`
- Set **Environment Variables** from `.env.example`
- Start with `npm start` (or a PM2 process)
- Point the domain in Namecheap to Hostinger nameservers (or set A records) and add the domain in hPanel

## Email Receipts (Optional)
- Add an email provider and send the download link after verification.
- Or use Paystack webhooks to confirm payments server-to-server.

## Reviews / Testimonials
- Stored inline in each product for now. You can later:
  - Move to a simple JSON DB or Notion API
  - Add a moderation flow and forms

---

**Made for WorkflowKits.com — sell your templates in minutes.**

## Manage Everything in Next.js (No external CMS)
- Set `ADMIN_PASSWORD` in env.
- Visit `/admin` to edit products (writes to `data/products.json`).
- Reviews are stored in `data/reviews.json` via `/api/reviews`.
- The site prefers `data/products.json` over the fallback in `data/`.

> On Hostinger, this runs as a persistent Node app, so JSON storage is fine for small catalogs. For larger stores, consider SQLite or a hosted DB later.


**Branding**: Place your logo at `public/logo.png` (recommended 256×256 PNG with transparent background). Colors are aligned to cyan `#06B6D4` and gold `#F59E0B`.
