// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { readUsers, verifyPassword, setSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";
// Never cache auth responses
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    // Guard method
    if (req.method !== "POST") {
      return NextResponse.json({ ok: false, error: "Method not allowed" }, { status: 405 });
    }

    const { email, password } = await req.json();

    // Basic validation
    if (!email || !password) {
      return NextResponse.json({ ok: false, error: "Email and password are required" }, { status: 400 });
    }

    const users = readUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === String(email).toLowerCase()
    );

    if (!user || !(await verifyPassword(String(password), user.passwordHash))) {
      // generic error (don’t leak which field failed)
      return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
    }

    // Set cookie
    setSessionCookie({ id: user.id, email: user.email });

    // Return minimal user info + no-store headers
    return NextResponse.json(
      { ok: true, user: { id: user.id, email: user.email } },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Login failed" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
