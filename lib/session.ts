// lib/session.ts
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE } from "./auth"; // keep a single source of truth

export type Session = { id: string; email: string } | null;

/** Verify and normalize the JWT payload into our Session shape */
function verifyToken(token?: string | null): Session {
  if (!token) return null;
  try {
    const secret = process.env.JWT_SECRET!;
    const payload = jwt.verify(token, secret) as any;

    // Our auth.ts signs { id, email }. Fall back to sub if ever needed.
    const id = String(payload.id ?? payload.sub ?? "");
    const email = String(payload.email ?? "");

    if (!id || !email) return null;
    return { id, email };
  } catch {
    return null;
  }
}

/** Use inside Route Handlers or middleware where you have NextRequest */
export function getSessionFromRequest(req: NextRequest): Session {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  return verifyToken(token);
}

/** Use inside server components/actions where you can call cookies() */
export function getSession(): Session {
  const token = cookies().get(AUTH_COOKIE)?.value;
  return verifyToken(token);
}
