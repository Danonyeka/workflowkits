import { createHash, randomBytes } from 'node:crypto';
export const recoveryMessage = 'If an account exists for that email, we will send a password reset link. You can also sign in with Google.';
export function resetTokenHash(token) { return createHash('sha256').update(token).digest('hex'); }
export function resetPasswordError(token, password) {
  if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(token)) return 'This reset link is invalid or expired. Request a new link.';
  if (typeof password !== 'string' || password.length < 12 || Buffer.byteLength(password, 'utf8') > 72) return 'Use at least 12 characters, up to 72 bytes, for your new password.';
  return null;
}
export async function requestRecovery(email, deps) {
  if (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return;
  const token = randomBytes(32).toString('base64url');
  const recipient = await deps.issue(email.trim().toLowerCase(), resetTokenHash(token));
  if (recipient) await deps.send(recipient, token);
}
export async function finishRecovery(token, password, deps) {
  const error = resetPasswordError(token, password);
  if (error) return error;
  const passwordHash = await deps.hashPassword(password);
  return await deps.consume(resetTokenHash(token), passwordHash) ? null : 'This reset link is invalid or expired. Request a new link.';
}
