import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
const base = process.env.SMOKE_ORIGIN || 'http://127.0.0.1:4180';
assert.ok(['127.0.0.1','localhost'].includes(new URL(base).hostname), 'Run these checks against a local preview only.');
let checks = 0;
async function check(path, status = 200) { const response = await fetch(base + path); assert.equal(response.status, status, path); checks++; return response; }
for (const path of ['/', '/business-software', '/catalog', '/categories/Templates', '/categories/E-Books', '/blog', '/about', '/contact', '/privacy', '/terms', '/login', '/register']) await check(path);
await check('/products/not-a-resource', 404);
await check('/api/download?slug=project-charter-template', 401);
await check('/api/download?token=invalid', 401);
await check('/api/email-download?slug=project-charter-template&to=preview@example.invalid', 401);
await check('/api/_test-email', 404);
assert.equal((await (await check('/api/auth/session')).json()).ok, false);
const sitemap = await (await check('/sitemap.xml')).text();
for (const path of ['/business-software', '/about', '/contact', '/privacy', '/terms', '/categories/Templates']) assert.ok(sitemap.includes('https://workflowkits.com' + path));
checks++;
const catalog = await (await check('/catalog')).text();
assert.equal((catalog.match(/aria-label="View Project Status Report \(Word\)"/g) || []).length, 1, 'Duplicate resource should display once.');
assert.ok(catalog.includes('resource-placeholder.svg'), 'Missing cover should use the fallback image.');
checks += 2;
if (process.env.SMOKE_JWT_SECRET) {
  for (const filename of ['project-charter-template.docx','project-execution-plan.docx','lessons-learned-journal.pdf','project-execution-strategy.docx','monthly-project-report-sample.docx','risk-register.xlsx']) {
    const token = jwt.sign({ filename }, process.env.SMOKE_JWT_SECRET, { expiresIn: '1m' });
    const response = await check('/api/download?token=' + encodeURIComponent(token));
    assert.ok((await response.arrayBuffer()).byteLength > 0);
  }
}
console.log(`${checks} local route, access-control and resource checks passed.`);
