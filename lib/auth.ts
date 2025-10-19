// lib/auth.ts
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import * as bcrypt from "bcryptjs";

const USERS_PATH = path.join(process.cwd(), "data", "users.json");

// ===== Session cookie config =====
export const AUTH_COOKIE = "wk_session";

/**
 * If you set NEXT_PUBLIC_COOKIE_DOMAIN=".workflowkits.com" in Vercel,
 * cookies will be valid on both apex and www. Falls back to host-only.
 */
function getCookieDomain(): string | undefined {
  const d = process.env.NEXT_PUBLIC_COOKIE_DOMAIN?.trim();
  // Accept ".example.com" or "example.com" — normalize to leading dot
  if (!d) return undefined;
  return d.startsWith(".") ? d : `.${d}`;
}

function cookieBaseOptions() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    domain: getCookieDomain(), // may be undefined → host-only
  };
}

// ===== Users store =====
export type User = {
  id: string;
  email: string;
  name?: string;
  passwordHash: string;
  createdAt: string;
};

function ensureUsersFile() {
  if (!fs.existsSync(USERS_PATH)) fs.writeFileSync(USERS_PATH, "[]", "utf8");
}

export function readUsers(): User[] {
  ensureUsersFile();
  return JSON.parse(fs.readFileSync(USERS_PATH, "utf8"));
}

export function writeUsers(users: User[]) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2), "utf8");
}

// ===== Password helpers =====
export async function hashPassword(pw: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pw, salt);
}

export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

// ===== Session helpers =====
export function setSessionCookie(payload: { id: string; email: string }) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");

  const token = jwt.sign(payload, secret, { expiresIn: "7d" });

  cookies().set(AUTH_COOKIE, token, {
    ...cookieBaseOptions(),
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export function clearSessionCookie() {
  cookies().set(AUTH_COOKIE, "", {
    ...cookieBaseOptions(),
    maxAge: 0,
    expires: new Date(0),
  });
}

export function getSession(): { id: string; email: string } | null {
  const token = cookies().get(AUTH_COOKIE)?.value;
  if (!token) return null;

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return null;
    return jwt.verify(token, secret) as any; // { id, email, iat, exp }
  } catch {
    return null;
  }
}

/** Convenience accessor when you only need the email */
export function getSessionEmail(): string | null {
  const s = getSession();
  return s?.email ?? null;
}
