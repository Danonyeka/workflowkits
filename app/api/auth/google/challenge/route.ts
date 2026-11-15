import { NextRequest } from "next/server";
import { requireGoogleRequest, googleChallenge, googleFailure } from "@/lib/google-http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export function POST(req: NextRequest) { try { requireGoogleRequest(req); return googleChallenge(); } catch (error) { return googleFailure(error); } }
