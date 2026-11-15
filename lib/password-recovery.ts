import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { database } from "./account-store";
import { hashPassword } from "./auth";
import { requestRecovery, finishRecovery, recoveryMessage } from "./recovery-core.mjs";

export async function issueReset(email: string, tokenHash: string) {
  const client = await database().connect();
  try {
    await client.query("BEGIN");
    const user = (await client.query("SELECT id,email FROM workflowkits_resource_accounts WHERE lower(email)=$1 FOR UPDATE", [email])).rows[0];
    if (!user) { await client.query("COMMIT"); return null; }
    const recent = await client.query("SELECT 1 FROM workflowkits_password_resets WHERE user_id=$1 AND created_at>now()-interval '60 seconds'", [user.id]);
    if (recent.rowCount) { await client.query("COMMIT"); return null; }
    await client.query("DELETE FROM workflowkits_password_resets WHERE user_id=$1 OR expires_at<now()", [user.id]);
    await client.query("INSERT INTO workflowkits_password_resets(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '30 minutes')", [tokenHash, user.id]);
    await client.query("COMMIT"); return user.email as string;
  } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); }
}
export async function consumeReset(tokenHash: string, passwordHash: string) {
  const client = await database().connect();
  try {
    await client.query("BEGIN");
    // All password-reset operations take the account lock first, preventing replay and deadlocks.
    const account = (await client.query("SELECT a.id FROM workflowkits_resource_accounts a JOIN workflowkits_password_resets r ON r.user_id=a.id WHERE r.token_hash=$1 AND r.expires_at>now() FOR UPDATE OF a", [tokenHash])).rows[0];
    if (!account) { await client.query("ROLLBACK"); return false; }
    const token = await client.query("DELETE FROM workflowkits_password_resets WHERE token_hash=$1 AND expires_at>now() RETURNING user_id", [tokenHash]);
    if (!token.rowCount) { await client.query("ROLLBACK"); return false; }
    await client.query("UPDATE workflowkits_resource_accounts SET record=record || jsonb_build_object('passwordHash',$2::text,'sessionVersion',COALESCE((record->>'sessionVersion')::int,0)+1,'passwordChangedAt',now()) WHERE id=$1", [account.id, passwordHash]);
    await client.query("DELETE FROM workflowkits_password_resets WHERE user_id=$1", [account.id]);
    await client.query("COMMIT"); return true;
  } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); }
}
async function guard(req: NextRequest) {
  if (req.headers.get("origin") !== req.nextUrl.origin || req.headers.get("x-wk-auth") !== "1") return false;
  const key = createHash("sha256").update(`${req.nextUrl.pathname}:${req.headers.get("x-forwarded-for") || "unknown"}`).digest("hex");
  await database().query("DELETE FROM workflowkits_auth_limits WHERE expires_at<now()");
  const result = await database().query("INSERT INTO workflowkits_auth_limits AS limits(key_hash,attempts,expires_at) VALUES($1,1,now()+interval '1 hour') ON CONFLICT(key_hash) DO UPDATE SET attempts=limits.attempts+1 RETURNING attempts", [key]);
  return result.rows[0].attempts <= 20;
}
export async function recoveryRequest(req: NextRequest, finish: boolean) {
  const headers = { "Cache-Control": "no-store" };
  try {
    if (!await guard(req)) return NextResponse.json({ ok: false, error: "Please wait before trying again, and use the form on this website." }, { status: 429, headers });
    const bodyText = await req.text();
    if (bodyText.length > 4096) return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400, headers });
    const body = JSON.parse(bodyText);
    if (finish) {
      const error = await finishRecovery(body.token, body.password, { hashPassword, consume: consumeReset });
      return NextResponse.json(error ? { ok: false, error } : { ok: true }, { status: error ? 400 : 200, headers });
    }
    const started = Date.now();
    await requestRecovery(body.email, { issue: issueReset, send: async (email: string, token: string) => {
      const url = new URL("/reset-password", "https://workflowkits.com"); url.hash = token;
      const result = await new Resend(process.env.RESEND_API_KEY).emails.send({ from: process.env.RESEND_FROM!, to: email, subject: "Reset your WorkflowKits password", text: `Use this private link to choose a new WorkflowKits website password:\n\n${url}\n\nThis link expires in 30 minutes and can be used once. If you did not request this, ignore this email. Your password has not changed. WDT POS accounts are managed separately.` });
      // Never reveal account existence through provider failures.
      if (result.error) return;
    } });
    await new Promise(resolve => setTimeout(resolve, Math.max(0, 1000 - (Date.now() - started))));
    return NextResponse.json({ ok: true, message: recoveryMessage }, { headers });
  } catch { return NextResponse.json(finish ? { ok: false, error: "Password reset is temporarily unavailable. Please try again." } : { ok: true, message: recoveryMessage }, { status: finish ? 503 : 200, headers }); }
}
