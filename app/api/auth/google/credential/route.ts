import { NextRequest } from "next/server";
import { handleGoogle } from "@/lib/google-http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export function POST(req: NextRequest) { return handleGoogle(req, false); }
