// lib/auth.ts
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import * as bcrypt from "bcryptjs";
import { accountDatabaseConfigured, databaseUsers, saveDatabaseUsers, registrationStorageReady, accountSessionVersion } from "./account-store";

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
  termsAcceptance?: { version: string; acceptedAt: string };
  googleSubject?: string;
  emailVerifiedAt?: string;
  sessionVersion?: number;
};

function ensureUsersFile() {
  if (!fs.existsSync(USERS_PATH)) {
    fs.mkdirSync(path.dirname(USERS_PATH), { recursive: true });
    fs.writeFileSync(USERS_PATH, "[]", "utf8");
  }
}
function legacyUsers(): User[] {
  if (!fs.existsSync(USERS_PATH)) return [];
  return JSON.parse(fs.readFileSync(USERS_PATH, "utf8"));
}
export async function readUsers(): Promise<User[]> {
  return accountDatabaseConfigured() ? databaseUsers(legacyUsers) : legacyUsers();
}
export async function writeUsers(users: User[]) {
  if (accountDatabaseConfigured()) return saveDatabaseUsers(users, legacyUsers);
  if (!registrationStorageReady()) throw new Error("New account registration is awaiting private account-storage setup. Existing accounts can still sign in.");
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
export function setSessionCookie(payload: { id: string; email: string; sessionVersion?: number }) {
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

export async function verifySessionToken(token?: string): Promise<{ id: string; email: string } | null> {
  if (!token) return null;
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return null;
    const payload = jwt.verify(token, secret) as { id: string; email: string; sessionVersion?: number };
    if (!payload.id || !payload.email || (payload.sessionVersion || 0) !== await accountSessionVersion(payload.id)) return null;
    return { id: payload.id, email: payload.email };
  } catch {
    return null;
  }
}
export async function getSession() { return verifySessionToken(cookies().get(AUTH_COOKIE)?.value); }
export async function getSessionEmail(): Promise<string | null> {
  const s = await getSession();
  return s?.email ?? null;
}

// ---------- explicit export list (helps TS/webpack resolvers) ----------
export {
  ensureUsersFile, // optional to export
};
