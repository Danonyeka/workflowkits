// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  hashPassword,
  readUsers,
  writeUsers,
  setSessionCookie,
} from "@/lib/auth";
import { randomUUID } from "crypto";
import { TERMS_VERSION, termsAcceptanceError } from "@/lib/terms";
import { registrationStorageReady } from "@/lib/account-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    if (req.method !== "POST") {
      return NextResponse.json({ ok: false, error: "Method not allowed" }, { status: 405 });
    }

    const { email, password, name, acceptedTerms, termsVersion } = await req.json();
    const acceptanceError = termsAcceptanceError(acceptedTerms, termsVersion);
    if (acceptanceError) {
      return NextResponse.json({ ok: false, error: acceptanceError }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (!registrationStorageReady()) return NextResponse.json({ ok: false, error: "New account registration is awaiting private account-storage setup. Existing accounts can still sign in." }, { status: 503, headers: { "Cache-Control": "no-store" } });
    const normEmail = String(email).trim().toLowerCase();
    const users = await readUsers();

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
      termsAcceptance: { version: TERMS_VERSION, acceptedAt: new Date().toISOString() },
    };

    users.push(user);
    await writeUsers(users);

    // sign in immediately
    setSessionCookie({ id: user.id, email: user.email });

    return NextResponse.json(
      { ok: true, user: { id: user.id, email: user.email, name: user.name ?? null } },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.code === "23505" ? "This email already has an account. Please sign in." : "Registration could not be completed. Please try again or contact support." },
      { status: e?.code === "23505" ? 409 : 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
