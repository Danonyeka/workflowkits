import test from 'node:test';
import assert from 'node:assert/strict';
import { TERMS_VERSION, termsAcceptanceError } from '../lib/terms.ts';

test('registration rejects missing, unchecked and truthy-but-not-boolean consent', () => {
  for (const accepted of [undefined, null, false, 'true', 1, {}, []]) assert.match(termsAcceptanceError(accepted, TERMS_VERSION), /accept the Terms/);
});
test('registration rejects consent for missing, stale or unrecognised terms', () => {
  for (const version of [undefined, null, '', '2025-01-01', true]) assert.match(termsAcceptanceError(true, version), /changed/);
});
test('registration accepts only an explicit agreement to the current version', () => {
  assert.equal(termsAcceptanceError(true, TERMS_VERSION), null);
});
