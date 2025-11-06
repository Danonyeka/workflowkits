// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  hashPassword,
  readUsers,
  writeUsers,
  setSessionCookie,
} from "@/lib/auth";
import { randomUUID } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    if (req.method !== "POST") {
      return NextResponse.json({ ok: false, error: "Method not allowed" }, { status: 405 });
    }

    const { email, password, name } = await req.json();

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normEmail = String(email).trim().toLowerCase();
    const users = readUsers();

    if (users.some((u) => u.email.toLowerCase() === normEmail)) {
      return NextResponse.json(
        { ok: false, error: "Email already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(String(password));
    const user = {
      id: randomUUID(),
      email: normEmail,
      name: name ? String(name).trim() : undefined,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    writeUsers(users);

    // sign in immediately
    setSessionCookie({ id: user.id, email: user.email });

    return NextResponse.json(
      { ok: true, user: { id: user.id, email: user.email, name: user.name ?? null } },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Registration failed" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
