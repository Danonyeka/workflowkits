import { NextRequest, NextResponse } from "next/server";
import { hashPassword, readUsers, writeUsers, setSessionCookie } from "@/lib/auth";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json();
  if (!email || !password) return NextResponse.json({ ok: false, error: "Email & password required" }, { status: 400 });

  const users = readUsers();
  if (users.find(u => u.email.toLowerCase() === String(email).toLowerCase())) {
    return NextResponse.json({ ok: false, error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = { id: randomUUID(), email, name, passwordHash, createdAt: new Date().toISOString() };
  users.push(user);
  writeUsers(users);

  setSessionCookie({ id: user.id, email: user.email });
  return NextResponse.json({ ok: true });
}
