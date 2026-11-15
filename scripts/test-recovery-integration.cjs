const fs = require('node:fs');
const assert = require('node:assert/strict');
const { randomUUID, randomBytes, createHash } = require('node:crypto');
const { spawn, spawnSync } = require('node:child_process');
const { Client } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

let stage = "configuration";
async function main() {
  process.loadEnvFile('.vercel/account-setup.env');
  const schema = 'wk_auth_test_' + randomUUID().replaceAll('-', '');
  const uri = new URL(process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL);
  const admin = new Client({ connectionString: uri.toString() }); await admin.connect();
  let app, db;
  try {
    stage = "create isolated schema"; await admin.query(`CREATE SCHEMA "${schema}"`);
    uri.searchParams.set('options', '-c search_path=' + schema);
    stage = "connect isolated schema"; db = new Client({ connectionString: uri.toString() }); await db.connect();
    await db.query(fs.readFileSync('migrations/001-resource-accounts.sql', 'utf8'));
    await db.query(fs.readFileSync('migrations/002-password-recovery.sql', 'utf8'));
    stage = "create disposable fixture"; const user = { id: randomUUID(), email: 'recovery-fixture@example.invalid', passwordHash: await bcrypt.hash('Old-fixture-password-only', 10), googleSubject: 'fixture-subject', createdAt: new Date().toISOString() };
    await db.query('INSERT INTO workflowkits_resource_accounts(id,email,google_subject,record) VALUES($1,$2,$3,$4)', [user.id, user.email, user.googleSubject, JSON.stringify(user)]);
    const token = randomBytes(32).toString('base64url');
    const hash = createHash('sha256').update(token).digest('hex');
    await db.query("INSERT INTO workflowkits_password_resets(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '30 minutes')", [hash,user.id]);
    stage = "start local preview"; const secret = 'isolated-local-recovery-test-secret';
    app = spawn(process.execPath, ['node_modules/next/dist/bin/next','start','--hostname','localhost','--port','4187'], { stdio: 'ignore', env: { ...process.env, ACCOUNT_DATABASE_URL: uri.toString(), JWT_SECRET: secret, NEXT_PUBLIC_COOKIE_DOMAIN: '', RESEND_API_KEY: 're_local_preview_only', RESEND_FROM: 'preview@example.invalid', GOOGLE_CLIENT_ID: '', NEXT_TELEMETRY_DISABLED: '1' } });
    const origin = 'http://localhost:4187';
    let ready = false;
    for (let attempt=0;attempt<100;attempt++) { try { if ((await fetch(origin+'/login')).ok) { ready=true;break; } } catch {} await new Promise(resolve=>setTimeout(resolve,200)); }
    assert.ok(ready, 'Local preview must start.'); assert.equal(app.exitCode,null,'The owned preview process must be running.');
    const headers = { 'Content-Type':'application/json', Origin:origin, 'X-WK-Auth':'1' };
    stage = "verify initial session"; const oldCookie = 'wk_session='+jwt.sign({id:user.id,email:user.email},secret,{expiresIn:'5m'});
    assert.equal((await (await fetch(origin+'/api/auth/session',{headers:{Cookie:oldCookie}})).json()).ok,true);
    const post = (path,body)=>fetch(origin+path,{method:'POST',headers,body:JSON.stringify(body)});
    stage = "reset password"; const reset = await post('/api/auth/reset-password',{token,password:'New-fixture-password-only'}); console.log(JSON.stringify({resetStatus:reset.status,response:await reset.clone().json()})); assert.equal(reset.status,200);
    stage = "reject reused token"; assert.equal((await post('/api/auth/reset-password',{token,password:'Another-password-only'})).status,400);
    assert.equal((await (await fetch(origin+'/api/auth/session',{headers:{Cookie:oldCookie}})).json()).ok,false);
    stage = "verify persisted password and revoked session"; const record=(await db.query('SELECT record FROM workflowkits_resource_accounts WHERE id=$1',[user.id])).rows[0].record;
    assert.ok(await bcrypt.compare('New-fixture-password-only',record.passwordHash)); assert.equal(record.googleSubject,user.googleSubject); assert.equal(record.sessionVersion,1);
    stage = "sign in after reset"; const login = await post('/api/auth/login',{email:user.email,password:'New-fixture-password-only'}); assert.equal(login.status,200);
    const newCookie=login.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');
    assert.equal((await (await fetch(origin+'/api/auth/session',{headers:{Cookie:newCookie}})).json()).ok,true);
    stage = "reject expired token"; const expired=randomBytes(32).toString('base64url');
    await db.query("INSERT INTO workflowkits_password_resets(token_hash,user_id,expires_at) VALUES($1,$2,now()-interval '1 minute')",[createHash('sha256').update(expired).digest('hex'),user.id]);
    assert.equal((await post('/api/auth/reset-password',{token:expired,password:'Never-accepted-password'})).status,400);
    assert.equal((await post('/api/auth/forgot-password',{email:'missing@example.invalid'})).status,200);
    assert.equal((await fetch(origin+'/forgot-password')).status,200); assert.equal((await fetch(origin+'/reset-password')).status,200);
    assert.equal(spawnSync(process.execPath,['scripts/smoke-test.mjs'],{stdio:'inherit',env:{...process.env,SMOKE_ORIGIN:origin,SMOKE_JWT_SECRET:secret}}).status,0,'Existing routes and downloads must still work.');
    console.log('Isolated recovery integration passed: single use, expiry, password update, preserved Google identity, old-session revocation and new-session sign-in. No real emails sent.');
  } finally {
    if(app) app.kill(); if(db) await db.end();
    // Only this newly-created disposable test schema is removed.
    if(!/^wk_auth_test_[a-f0-9]{32}$/.test(schema)) throw Error('Unexpected test schema.');
    await admin.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`); await admin.end();
  }
}
main().catch(()=>{console.error('Isolated recovery integration failed at ' + stage + '; private details withheld.');process.exitCode=1;});
