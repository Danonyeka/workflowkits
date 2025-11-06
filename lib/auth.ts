// lib/auth.ts
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import * as bcrypt from "bcryptjs";

// ---------- constants ----------
export const AUTH_COOKIE = "wk_session";
const USERS_PATH = path.join(process.cwd(), "data", "users.json");

// ---------- cookie domain helper ----------
function getCookieDomain(): string | undefined {
  const d = process.env.NEXT_PUBLIC_COOKIE_DOMAIN?.trim();
  if (!d) return undefined;
  return d.startsWith(".") ? d : `.${d}`;
}
function cookieBaseOptions() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    domain: getCookieDomain(), // undefined = host-only
  };
}

// ---------- user store ----------
export type User = {
  id: string;
  email: string;
  name?: string;
  passwordHash: string;
  createdAt: string;
};

function ensureUsersFile() {
  if (!fs.existsSync(USERS_PATH)) {
    fs.mkdirSync(path.dirname(USERS_PATH), { recursive: true });
    fs.writeFileSync(USERS_PATH, "[]", "utf8");
  }
}
export function readUsers(): User[] {
  ensureUsersFile();
  return JSON.parse(fs.readFileSync(USERS_PATH, "utf8"));
}
export function writeUsers(users: User[]) {
  ensureUsersFile();
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2), "utf8");
}

// ---------- password helpers ----------
export async function hashPassword(pw: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pw, salt);
}
export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

// ---------- session helpers ----------
export function setSessionCookie(payload: { id: string; email: string }) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  const token = jwt.sign(payload, secret, { expiresIn: "7d" });

  cookies().set(AUTH_COOKIE, token, {
    ...cookieBaseOptions(),
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/** Clear session on all likely scopes (fixes “auto-login after refresh”). */
export function clearSessionCookie() {
  const c = cookies();
  const base = {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
    maxAge: 0,
  };

  // host-only
  c.set(AUTH_COOKIE, "", base);

  // configured domain (e.g. ".workflowkits.com") + no-dot variant
  const domainWithDot = getCookieDomain();
  if (domainWithDot) {
    c.set(AUTH_COOKIE, "", { ...base, domain: domainWithDot });
    const domainNoDot = domainWithDot.startsWith(".")
      ? domainWithDot.slice(1)
      : domainWithDot;
    c.set(AUTH_COOKIE, "", { ...base, domain: domainNoDot });
  }
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
export function getSessionEmail(): string | null {
  const s = getSession();
  return s?.email ?? null;
}

// ---------- explicit export list (helps TS/webpack resolvers) ----------
export {
  ensureUsersFile, // optional to export
};
