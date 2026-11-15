import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const base = process.env.SMOKE_ORIGIN || 'http://127.0.0.1:4180';
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(base).hostname), 'Use a local preview only.');
const digest = async () => createHash('sha256').update(await readFile(new URL('../data/users.json', import.meta.url))).digest('hex');
const before = await digest();
const invalidAcceptance = [{}, { acceptedTerms: false, termsVersion: '2026-11-15' }, { acceptedTerms: 'true', termsVersion: '2026-11-15' }, { acceptedTerms: true, termsVersion: '2025-01-01' }];
for (const acceptance of invalidAcceptance) {
  const response = await fetch(base + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'consent-check@example.invalid', password: 'Local-test-only-not-a-real-password', ...acceptance }) });
  assert.equal(response.status, 400);
  assert.equal(response.headers.get('set-cookie'), null);
  assert.equal((await response.json()).ok, false);
}
assert.equal(await digest(), before, 'Rejected registration must not change existing account records.');
console.log('4 registration acceptance checks passed; no account records or sessions were created.');
