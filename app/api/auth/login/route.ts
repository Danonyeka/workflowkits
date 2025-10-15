import { NextRequest, NextResponse } from "next/server";
import { readUsers, verifyPassword, setSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const user = readUsers().find(u => u.email.toLowerCase() === String(email).toLowerCase());
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
  }
  setSessionCookie({ id: user.id, email: user.email });
  return NextResponse.json({ ok: true });
}
