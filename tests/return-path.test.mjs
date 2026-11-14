import test from 'node:test';
import assert from 'node:assert/strict';
import { returnPath } from '../lib/returnPath.ts';
test('resource sign-in returns to a local path with its query', () => { assert.equal(returnPath('/products/project-charter-template?source=catalog'), '/products/project-charter-template?source=catalog'); });
test('account navigation rejects external URLs and browser URL separators', () => {
  for (const value of [undefined, null, '', 'https://example.com', '//example.com', '/\\example.com', '/\n/example.com', 'javascript:alert(1)']) assert.equal(returnPath(value), '/');
});
