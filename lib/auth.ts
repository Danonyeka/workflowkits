// lib/auth.ts
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import * as bcrypt from "bcryptjs";

const USERS_PATH = path.join(process.cwd(), "data", "users.json");

export const AUTH_COOKIE = "wk_session";

/** If you set NEXT_PUBLIC_COOKIE_DOMAIN=".workflowkits.com" it will cover apex + subdomains */
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
    domain: getCookieDomain(), // may be undefined → host-only
  };
}

// ------------------ users store & password helpers unchanged ------------------

export function setSessionCookie(payload: { id: string; email: string }) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  const token = jwt.sign(payload, secret, { expiresIn: "7d" });

  cookies().set(AUTH_COOKIE, token, {
    ...cookieBaseOptions(),
    maxAge: 60 * 60 * 24 * 7,
  });
}

/** Clear session cookie for ALL likely scopes to avoid “auto-login after refresh”. */
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

  // 1) current host (host-only cookie)
  c.set(AUTH_COOKIE, "", base);

  // 2) configured domain cookie (e.g., ".workflowkits.com")
  const domainWithDot = getCookieDomain();
  if (domainWithDot) {
    c.set(AUTH_COOKIE, "", { ...base, domain: domainWithDot });

    // 3) the same domain without the leading dot (some browsers show either form)
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
    return jwt.verify(token, secret) as any;
  } catch {
    return null;
  }
}

export function getSessionEmail(): string | null {
  const s = getSession();
  return s?.email ?? null;
}
