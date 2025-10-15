import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

const map = new Map<string, number>();

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  const now = Date.now();
  const last = map.get(ip) || 0;
  if (now - last < 5000) {
    return NextResponse.json({ ok:false, error:"Slow down" }, { status: 429 });
  }
  map.set(ip, now);

  const body = await req.json();
  const { slug, name, text, rating } = body || {};
  if (!slug || !name || !text) {
    return NextResponse.json({ ok:false, error:"Missing fields" }, { status: 400 });
  }

  try {
    const dir = path.join(process.cwd(), "data");
    await mkdir(dir, { recursive: true });
    const file = path.join(dir, "reviews.json");
    let db:any = {};
    try {
      const buf = await readFile(file, "utf-8");
      db = JSON.parse(buf || "{}");
    } catch {}
    db[slug] = db[slug] || [];
    db[slug].push({ name, text, rating: Number(rating||0), ts: new Date().toISOString() });
    await writeFile(file, JSON.stringify(db, null, 2), "utf-8");
    return NextResponse.json({ ok: true });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:e.message }, { status: 500 });
  }
}
