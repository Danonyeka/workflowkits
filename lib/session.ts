// lib/session.ts
import jwt from "jsonwebtoken";
import type { NextRequest } from "next/server";

export type Session = { userId: string; email: string };

export function getSession(req: NextRequest): Session | null {
  const token = req.cookies.get("wk_session")?.value; // <- your login cookie name
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return { userId: String(payload.sub), email: String(payload.email) };
  } catch {
    return null;
  }
}
