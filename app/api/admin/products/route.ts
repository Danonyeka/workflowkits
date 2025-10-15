import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  const pass = req.headers.get("x-admin") || "";
  if (!process.env.ADMIN_PASSWORD || pass !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const products = body?.products;
  if (!Array.isArray(products)) return NextResponse.json({ ok:false, error:"Invalid payload" }, { status: 400 });
  try {
    const file = path.join(process.cwd(), "data", "products.json");
    await writeFile(file, JSON.stringify(products, null, 2), "utf-8");
    return NextResponse.json({ ok: true });
  } catch (e:any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
