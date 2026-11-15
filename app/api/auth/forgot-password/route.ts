import { NextRequest } from "next/server";
import { recoveryRequest } from "@/lib/password-recovery";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) { return recoveryRequest(req, false); }
