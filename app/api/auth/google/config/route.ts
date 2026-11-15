import { NextResponse } from "next/server";
import { googleReady } from "@/lib/google-http";
import { registrationStorageReady } from "@/lib/account-store";
export const dynamic = "force-dynamic";
export function GET() { return NextResponse.json({ enabled: googleReady(), registrationAvailable: registrationStorageReady() }, { headers: { "Cache-Control": "no-store" } }); }
