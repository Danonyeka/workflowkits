import { OAuth2Client } from 'google-auth-library';
import { randomBytes, randomUUID } from 'node:crypto';

export class GoogleAuthError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export async function verifyGoogleCredential(credential, nonce, clientId, verifyToken, now = Date.now()) {
  if (typeof credential !== 'string' || credential.length > 16000 || typeof nonce !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(nonce)) throw new GoogleAuthError(401, 'Google sign-in expired. Please start again.');
  let claims;
  try { claims = verifyToken ? await verifyToken(credential, clientId) : (await new OAuth2Client(clientId).verifyIdToken({ idToken: credential, audience: clientId })).getPayload(); }
  catch { throw new GoogleAuthError(401, 'Google could not verify this sign-in. Please try again.'); }
  if (!claims || !['accounts.google.com', 'https://accounts.google.com'].includes(claims.iss) || claims.aud !== clientId || claims.nonce !== nonce || claims.email_verified !== true || typeof claims.sub !== 'string' || !claims.sub || claims.sub.length > 255 || typeof claims.email !== 'string' || claims.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(claims.email) || !Number.isFinite(claims.exp) || claims.exp * 1000 <= now || !Number.isFinite(claims.iat) || claims.iat * 1000 > now + 30000 || now - claims.iat * 1000 > 330000) throw new GoogleAuthError(401, 'Google could not verify this sign-in. Please start again.');
  const email = claims.email.trim().toLowerCase();
  return { subject: claims.sub, email, name: String(claims.name || '').slice(0, 120), authoritativeEmail: email.endsWith('@gmail.com') || (typeof claims.hd === 'string' && !!claims.hd) };
}

// Storage is injected so account creation/linking can be tested without real records.
export async function resolveGoogleAccount(identity, input, deps) {
  const users = await deps.readUsers();
  const connected = users.find(user => user.googleSubject === identity.subject);
  if (connected) {
    if (connected.email.toLowerCase() !== identity.email) throw new GoogleAuthError(409, 'Your Google email address changed. Contact support to update your account safely.');
    return { mode: 'signed-in', user: connected };
  }
  const existing = users.find(user => user.email.toLowerCase() === identity.email);
  if (existing) {
    if (existing.googleSubject && existing.googleSubject !== identity.subject) throw new GoogleAuthError(409, 'This account is connected to another Google identity. Use email sign-in or contact support.');
    // Gmail and verified Workspace ownership are authoritative according to Google.
    // Other Google email addresses still need proof of the existing website account.
    if (!identity.authoritativeEmail) {
      if (input.kind !== 'link') return { mode: 'link', identity };
      if (typeof input.password !== 'string' || !input.password || input.password.length > 128 || !(await deps.verifyPassword(input.password, existing.passwordHash))) throw new GoogleAuthError(401, 'Enter the correct password for your existing WorkflowKits account to connect Google.');
    }
    const live = await deps.readUsers();
    const user = live.find(item => item.id === existing.id);
    if (!user || user.passwordHash !== existing.passwordHash || (user.googleSubject && user.googleSubject !== identity.subject)) throw new GoogleAuthError(409, 'This account changed. Start Google sign-in again.');
    user.googleSubject = identity.subject;
    user.emailVerifiedAt = deps.now();
    await deps.writeUsers(live);
    return { mode: 'signed-in', user };
  }
  if (!identity.authoritativeEmail) throw new GoogleAuthError(403, 'Use a Gmail or verified Google Workspace account for Google registration, or register with email and password.');
  const acceptanceError = deps.termsError(input.acceptedTerms, input.termsVersion);
  if (acceptanceError) {
    if (input.kind === 'start' && input.acceptedTerms !== true) return { mode: 'register', identity };
    throw new GoogleAuthError(400, acceptanceError);
  }
  const passwordHash = await deps.hashPassword(randomBytes(32).toString('base64url'));
  const live = await deps.readUsers();
  const raced = live.find(user => user.googleSubject === identity.subject);
  if (raced || live.some(user => user.email.toLowerCase() === identity.email)) return resolveGoogleAccount(identity, input, deps);
  const time = deps.now();
  const user = { id: randomUUID(), email: identity.email, name: identity.name || undefined, passwordHash, createdAt: time, googleSubject: identity.subject, emailVerifiedAt: time, termsAcceptance: { version: deps.termsVersion, acceptedAt: time } };
  live.push(user);
  await deps.writeUsers(live);
  return { mode: 'signed-in', user };
}
