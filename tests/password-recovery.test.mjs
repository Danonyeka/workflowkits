import test from 'node:test';
import assert from 'node:assert/strict';
import { requestRecovery, finishRecovery, resetTokenHash, resetPasswordError } from '../lib/recovery-core.mjs';

test('recovery stores only a hash and emails the random token to the matched account', async () => {
  let saved, delivered;
  await requestRecovery(' OWNER@example.com ', { issue: async (email, hash) => { assert.equal(email, 'owner@example.com'); saved = hash; return email; }, send: async (email, token) => { delivered = token; assert.equal(email, 'owner@example.com'); } });
  assert.match(delivered, /^[A-Za-z0-9_-]{43}$/); assert.equal(saved, resetTokenHash(delivered)); assert.notEqual(saved, delivered);
});
test('unknown and malformed account requests do not send email', async () => {
  let sends = 0;
  const deps = { issue: async () => null, send: async () => sends++ };
  for (const email of ['missing@example.invalid', '', null, 'not-an-email']) await requestRecovery(email, deps);
  assert.equal(sends, 0);
});
test('reset validates password length and token before hashing or writing', async () => {
  let writes = 0;
  const deps = { hashPassword: async () => { writes++; return 'hash'; }, consume: async () => { writes++; return true; } };
  for (const [token, password] of [['invalid', 'long-enough-password'], ['t'.repeat(43), 'short'], ['t'.repeat(43), '😀'.repeat(30)]]) assert.ok(await finishRecovery(token, password, deps));
  assert.equal(writes, 0); assert.equal(resetPasswordError('t'.repeat(43), 'long-enough-password'), null);
});
test('only an unexpired unused token can change a password; retry and expiry fail', async () => {
  const token = 't'.repeat(43); let available = true, changed = 0;
  const deps = { hashPassword: async () => 'new-password-hash', consume: async (hash, password) => { assert.equal(hash, resetTokenHash(token)); assert.equal(password, 'new-password-hash'); if (!available) return false; available = false; changed++; return true; } };
  assert.equal(await finishRecovery(token, 'long-enough-password', deps), null);
  assert.ok(await finishRecovery(token, 'long-enough-password', deps)); assert.equal(changed, 1);
});
