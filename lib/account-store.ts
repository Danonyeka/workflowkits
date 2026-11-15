import { Pool } from "pg";
import type { User } from "./auth";

let pool: Pool | undefined;
let initialising: Promise<void> | undefined;
export function accountDatabaseConfigured() { return !!process.env.ACCOUNT_DATABASE_URL; }
export function registrationStorageReady() { return accountDatabaseConfigured() || process.env.NODE_ENV !== "production"; }
function database() {
  if (!process.env.ACCOUNT_DATABASE_URL) throw new Error("Private account storage is not configured.");
  return pool ||= new Pool({ connectionString: process.env.ACCOUNT_DATABASE_URL, max: 3, idleTimeoutMillis: 10000, connectionTimeoutMillis: 10000 });
}
async function ready(legacy: () => User[]) {
  if (!initialising) initialising = (async () => {
    const db = database();
    await db.query("CREATE TABLE IF NOT EXISTS workflowkits_resource_accounts (id text PRIMARY KEY, email text UNIQUE NOT NULL, google_subject text UNIQUE, record jsonb NOT NULL)");
    // Import old accounts once per server start, without overwriting migrated data.
    for (const user of legacy()) await db.query("INSERT INTO workflowkits_resource_accounts(id,email,google_subject,record) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING", [user.id, user.email.toLowerCase(), user.googleSubject || null, JSON.stringify(user)]);
  })().catch(error => { initialising = undefined; throw error; });
  await initialising;
}
export async function databaseUsers(legacy: () => User[]): Promise<User[]> {
  await ready(legacy);
  return (await database().query("SELECT record FROM workflowkits_resource_accounts ORDER BY id")).rows.map(row => row.record as User);
}
export async function saveDatabaseUsers(users: User[], legacy: () => User[]) {
  await ready(legacy);
  const client = await database().connect();
  try {
    await client.query("BEGIN");
    for (const user of users) {
      const result = await client.query("INSERT INTO workflowkits_resource_accounts AS accounts(id,email,google_subject,record) VALUES($1,$2,$3,$4) ON CONFLICT(id) DO UPDATE SET email=EXCLUDED.email,google_subject=COALESCE(accounts.google_subject,EXCLUDED.google_subject),record=accounts.record || EXCLUDED.record WHERE accounts.google_subject IS NULL OR EXCLUDED.google_subject IS NULL OR accounts.google_subject=EXCLUDED.google_subject", [user.id, user.email.toLowerCase(), user.googleSubject || null, JSON.stringify(user)]);
      if (result.rowCount !== 1) throw new Error("This account changed. Please start again.");
    }
    await client.query("COMMIT");
  } catch (error) { await client.query("ROLLBACK"); throw error; }
  finally { client.release(); }
}
