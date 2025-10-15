import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug") || "";
  try {
    const file = path.join(process.cwd(), "data", "reviews.json");
    const txt = await readFile(file, "utf-8").catch(()=>"{}");
    const db = JSON.parse(txt || "{}");
    return NextResponse.json({ ok:true, reviews: db[slug] || [] });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:e.message }, { status: 500 });
  }
}
