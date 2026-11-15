import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { readUsers, writeUsers, hashPassword, verifyPassword, setSessionCookie } from "./auth";
import { TERMS_VERSION, termsAcceptanceError } from "./terms";
import { GoogleAuthError, resolveGoogleAccount, verifyGoogleCredential } from "./google-core.mjs";
import { registrationStorageReady } from "./account-store";

export const googleClientId = (process.env.GOOGLE_CLIENT_ID || "").trim();
export const googleReady = () => !!googleClientId && !!process.env.JWT_SECRET && registrationStorageReady();
const production = process.env.NODE_ENV === "production";
const nonceCookie = production ? "__Host-wk_google_nonce" : "wk_google_nonce";
const pendingCookie = production ? "__Host-wk_google_pending" : "wk_google_pending";
const cookieOptions = { httpOnly: true, secure: production, sameSite: "strict" as const, path: "/", maxAge: 300 };
const limits = new Map<string, { count: number; expires: number }>();

export function requireGoogleRequest(req: NextRequest) {
  if (!googleReady()) throw new GoogleAuthError(503, "Google sign-in is not available yet. Use email and password.");
  if (req.headers.get("origin") !== req.nextUrl.origin || req.headers.get("x-wk-auth") !== "1") throw new GoogleAuthError(403, "Start Google sign-in from this website.");
  const now = Date.now();
  const key = `${req.nextUrl.pathname}:${req.headers.get("x-forwarded-for") || "local"}`;
  for (const [id, value] of limits) if (value.expires < now) limits.delete(id);
  const value = limits.get(key) || { count: 0, expires: now + 600000 };
  if (++value.count > 20 || limits.size > 5000) throw new GoogleAuthError(429, "Too many Google sign-in attempts. Please wait and try again.");
  limits.set(key, value);
}
export function googleChallenge() {
  const nonce = randomBytes(32).toString("base64url");
  const response = NextResponse.json({ ok: true, clientId: googleClientId, nonce }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set(nonceCookie, nonce, cookieOptions);
  response.cookies.set(pendingCookie, "", { ...cookieOptions, maxAge: 0 });
  return response;
}
export function googleFailure(error: unknown) {
  const known = error instanceof GoogleAuthError;
  return NextResponse.json({ ok: false, error: known ? (error as Error).message : "Google sign-in could not be completed. Please try again or use email sign-in." }, { status: known ? (error as GoogleAuthError).status : 500, headers: { "Cache-Control": "no-store" } });
}
export async function handleGoogle(req: NextRequest, finish: boolean) {
  try {
    requireGoogleRequest(req);
    const body = await req.json();
    let credential = body.credential, nonce = req.cookies.get(nonceCookie)?.value;
    if (finish) {
      const pending = req.cookies.get(pendingCookie)?.value;
      if (!pending) throw new GoogleAuthError(401, "Google sign-in expired. Please start again.");
      const value = JSON.parse(pending);
      credential = value.credential; nonce = value.nonce;
    }
    const identity = await verifyGoogleCredential(credential, nonce, googleClientId);
    const result = await resolveGoogleAccount(identity, { ...body, kind: finish ? body.kind : "start" }, { readUsers, writeUsers, hashPassword, verifyPassword, termsError: termsAcceptanceError, termsVersion: TERMS_VERSION, now: () => new Date().toISOString() });
    if (result.mode === "signed-in") {
      setSessionCookie({ id: result.user.id, email: result.user.email, sessionVersion: result.user.sessionVersion });
      const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
      response.cookies.set(nonceCookie, "", { ...cookieOptions, maxAge: 0 });
      response.cookies.set(pendingCookie, "", { ...cookieOptions, maxAge: 0 });
      return response;
    }
    const pending = JSON.stringify({ credential, nonce });
    if (pending.length > 3600) throw new GoogleAuthError(400, "Google returned an unsupported sign-in response. Use email sign-in.");
    const response = NextResponse.json({ ok: false, mode: result.mode, email: identity.email }, { headers: { "Cache-Control": "no-store" } });
    response.cookies.set(nonceCookie, "", { ...cookieOptions, maxAge: 0 });
    response.cookies.set(pendingCookie, pending, cookieOptions);
    return response;
  } catch (error) { return googleFailure(error); }
}
