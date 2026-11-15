// Run with a private env file in the ignored .vercel directory. Never prints records.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { Client } = require('pg');

async function main() {
  process.loadEnvFile('.vercel/account-setup.env');
  const client = new Client({ connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL, connectionTimeoutMillis: 15000 });
  await client.connect();
  try {
    const legacy = JSON.parse(fs.readFileSync('data/users.json', 'utf8'));
    const oldDatabaseUsers = (await client.query('SELECT id,email,password_hash,created_at FROM public.users')).rows;
    const candidates = [...legacy];
    let overlapping = 0;
    // The active file account wins a collision; original database rows stay untouched.
    for (const row of oldDatabaseUsers) {
      if (candidates.some(user => user.id === row.id || user.email.toLowerCase() === row.email.toLowerCase())) { overlapping++; continue; }
      candidates.push({ id: row.id, email: row.email.toLowerCase(), passwordHash: row.password_hash, createdAt: new Date(row.created_at).toISOString() });
    }
    const backupDirectory = path.resolve('.vercel/private-backups');
    fs.mkdirSync(backupDirectory, { recursive: true });
    fs.writeFileSync(path.join(backupDirectory, `accounts-${Date.now()}.json`), JSON.stringify({ legacy, oldDatabaseUsers }), { flag: 'wx', mode: 0o600 });
    const schema = fs.readFileSync('migrations/001-resource-accounts.sql', 'utf8');
    const insert = async () => {
      await client.query(schema);
      for (const user of candidates) await client.query('INSERT INTO workflowkits_resource_accounts(id,email,google_subject,record) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING', [user.id, user.email.toLowerCase(), user.googleSubject || null, JSON.stringify(user)]);
      for (const user of legacy) {
        const stored = (await client.query('SELECT record FROM workflowkits_resource_accounts WHERE id=$1', [user.id])).rows[0]?.record;
        assert.equal(stored?.passwordHash, user.passwordHash, 'Active legacy password must be preserved.');
        assert.equal(stored?.email, user.email, 'Active legacy email must be preserved.');
      }
    };
    // Rehearse the additive migration and validation, then roll it back before applying.
    await client.query('BEGIN');
    try { await insert(); } finally { await client.query('ROLLBACK'); }
    await client.query('BEGIN');
    try { await insert(); await client.query('COMMIT'); } catch (error) { await client.query('ROLLBACK'); throw error; }
    const count = (await client.query('SELECT count(*)::int AS count FROM workflowkits_resource_accounts')).rows[0].count;
    console.log(JSON.stringify({ migration: 'verified', activeLegacyAccountsPreserved: legacy.length, previousDatabaseAccounts: oldDatabaseUsers.length, overlapping, accountCount: count, originalTablesUnchanged: true, privateBackupCreated: true }));
  } finally { await client.end(); }
}
main().catch(() => { console.error('Account migration failed. Private details withheld; inspect the configuration before retrying.'); process.exitCode = 1; });
