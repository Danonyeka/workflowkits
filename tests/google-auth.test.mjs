import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyGoogleCredential, resolveGoogleAccount } from '../lib/google-core.mjs';
import { TERMS_VERSION, termsAcceptanceError } from '../lib/terms.ts';

const now = Date.parse('2026-11-15T10:00:00Z'), nonce = 'n'.repeat(43), clientId = 'website-client.apps.googleusercontent.com';
const claims = { iss: 'https://accounts.google.com', aud: clientId, nonce, sub: 'google-subject', email: 'owner@workspace.example', email_verified: true, hd: 'workspace.example', name: 'Example Owner', iat: now / 1000, exp: now / 1000 + 3600 };
const identity = { subject: claims.sub, email: claims.email, name: claims.name, authoritativeEmail: true };
function fixture(initial = []) {
  let records = structuredClone(initial), writes = 0;
  return { records: () => records, writes: () => writes, deps: { readUsers: () => structuredClone(records), writeUsers: next => { records = structuredClone(next); writes++; }, hashPassword: async () => 'unusable-random-password-hash', verifyPassword: async (password, hash) => password === 'existing-password' && hash === 'legacy-hash', termsError: termsAcceptanceError, termsVersion: TERMS_VERSION, now: () => new Date(now).toISOString() } };
}
test('Google verification delegates signature checks and binds audience, nonce and verified identity', async () => {
  const result = await verifyGoogleCredential('signed-google-token', nonce, clientId, async (token, audience) => { assert.equal(token, 'signed-google-token'); assert.equal(audience, clientId); return claims; }, now);
  assert.deepEqual(result, identity);
  await assert.rejects(verifyGoogleCredential('bad-token', nonce, clientId, async () => { throw Error('Invalid signature'); }, now), error => error.status === 401);
});
test('Google verification rejects unverified, expired, stale, wrong-audience and wrong-nonce tokens', async () => {
  for (const patch of [{ email_verified: false }, { email_verified: 'true' }, { nonce: 'wrong' }, { aud: 'another-client' }, { iss: 'https://untrusted.example' }, { exp: now / 1000 - 1 }, { iat: now / 1000 - 3600 }, { sub: '' }]) await assert.rejects(verifyGoogleCredential('token', nonce, clientId, async () => ({ ...claims, ...patch }), now), error => error.status === 401);
});
test('new Google sign-in requires explicit current terms before creating any account', async () => {
  const f = fixture();
  assert.equal((await resolveGoogleAccount(identity, { kind: 'start' }, f.deps)).mode, 'register');
  for (const input of [{ acceptedTerms: false, termsVersion: TERMS_VERSION }, { acceptedTerms: 'true', termsVersion: TERMS_VERSION }, { acceptedTerms: true, termsVersion: 'old' }]) await assert.rejects(resolveGoogleAccount(identity, { kind: 'register', ...input }, f.deps), error => error.status === 400);
  assert.equal(f.writes(), 0); assert.equal(f.records().length, 0);
});
test('Google registration stores the verified subject and server-timestamped terms once', async () => {
  const f = fixture();
  const input = { kind: 'register', acceptedTerms: true, termsVersion: TERMS_VERSION };
  const first = await resolveGoogleAccount(identity, input, f.deps);
  assert.equal(first.mode, 'signed-in'); assert.equal(first.user.googleSubject, identity.subject);
  assert.deepEqual(first.user.termsAcceptance, { version: TERMS_VERSION, acceptedAt: new Date(now).toISOString() });
  assert.equal(first.user.emailVerifiedAt, new Date(now).toISOString());
  assert.equal((await resolveGoogleAccount(identity, { kind: 'start' }, f.deps)).user.id, first.user.id);
  assert.equal(f.records().length, 1); assert.equal(f.writes(), 1);
});
test('authoritative Google identity signs into the matching existing account without its password', async () => {
  const f = fixture([{ id: 'legacy', email: identity.email, passwordHash: 'legacy-hash', createdAt: '2025-01-01' }]);
  const result = await resolveGoogleAccount(identity, { kind: 'start' }, f.deps);
  assert.equal(result.mode, 'signed-in'); assert.equal(result.user.id, 'legacy');
  assert.equal(result.user.passwordHash, 'legacy-hash'); assert.equal(result.user.googleSubject, identity.subject);
  assert.equal(result.user.termsAcceptance, undefined); assert.equal(f.records().length, 1);
});

test('non-authoritative Google email still requires the existing account password', async () => {
  const identity = { subject: claims.sub, email: claims.email, authoritativeEmail: false };
  const f = fixture([{ id: 'legacy', email: identity.email, passwordHash: 'legacy-hash', createdAt: '2025-01-01' }]);
  assert.equal((await resolveGoogleAccount(identity, { kind: 'start' }, f.deps)).mode, 'link');
  assert.equal(f.writes(), 0);
  await assert.rejects(resolveGoogleAccount(identity, { kind: 'link', password: 'wrong' }, f.deps), error => error.status === 401);
  assert.equal(f.writes(), 0);
  const result = await resolveGoogleAccount(identity, { kind: 'link', password: 'existing-password' }, f.deps);
  assert.equal(result.user.id, 'legacy'); assert.equal(result.user.passwordHash, 'legacy-hash');
  assert.equal(result.user.termsAcceptance, undefined); assert.equal(result.user.googleSubject, identity.subject);
});
test('third-party Google email needs a separate verification path before new registration', async () => {
  const f = fixture();
  await assert.rejects(resolveGoogleAccount({ ...identity, authoritativeEmail: false }, { kind: 'register', acceptedTerms: true, termsVersion: TERMS_VERSION }, f.deps), error => error.status === 403);
  assert.equal(f.writes(), 0);
});
test('changed Google email does not silently redirect an existing account’s download emails', async () => {
  const f = fixture([{ id: 'linked', email: 'old@workspace.example', googleSubject: identity.subject, passwordHash: 'hash' }]);
  await assert.rejects(resolveGoogleAccount(identity, { kind: 'start' }, f.deps), error => error.status === 409);
  assert.equal(f.writes(), 0);
});
