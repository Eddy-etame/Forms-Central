/**
 * Programmatic test: password reset flow.
 * Run: node scripts/test-password-reset.mjs [baseUrl]  (default http://localhost:3005)
 * Uses the dev-only devToken returned by /forgot-password (never in production).
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import crypto from 'node:crypto';

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

const BASE = process.argv[2] || 'http://localhost:3005';
const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split(/\r?\n/).filter((l) => l && !l.trimStart().startsWith('#') && l.includes('='))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

let pass = 0, fail = 0; const failures = [];
const check = (n, ok, d = '') => ok ? (pass++, console.log(`  PASS  ${n}`)) : (fail++, failures.push(n), console.log(`  FAIL  ${n} ${d}`));
const j = { 'Content-Type': 'application/json' };
const post = (path, body) => fetch(`${BASE}${path}`, { method: 'POST', headers: j, body: JSON.stringify(body) });

const EMAIL = `pwreset+${Date.now()}@test.dev`;
const OLD = 'oldpassword123';
const NEW = 'brandNewPass456';
let clientId = null;

try {
  console.log(`\n== Password reset flow — ${BASE} ==`);

  // signup
  {
    const res = await post('/api/auth/client-signup', { name: 'Reset Test', email: EMAIL, password: OLD });
    const { data } = await sb.from('clients').select('id').eq('email', EMAIL).single();
    clientId = data?.id ?? null;
    check('signup works', res.status === 200 && !!clientId, `got ${res.status}`);
  }

  // forgot-password stores a hashed token (verified against DB)
  {
    const res = await post('/api/auth/forgot-password', { email: EMAIL });
    const body = await res.json();
    check('forgot-password returns success', res.status === 200 && body.success === true);
    check('forgot-password never leaks a raw token in the response', body.devToken === undefined && body.token === undefined);
    const { data } = await sb.from('clients').select('reset_token, reset_token_expires').eq('id', clientId).single();
    check('reset token stored hashed (64-hex) with expiry', !!data?.reset_token && data.reset_token.length === 64 && !!data.reset_token_expires);
  }

  // Deterministic token for the reset assertions: inject our own (hash to DB,
  // keep the raw). This exercises the real /reset-password endpoint without
  // relying on any dev-only response.
  const token = crypto.randomBytes(32).toString('base64url');
  await sb.from('clients').update({
    reset_token: sha256(token),
    reset_token_expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  }).eq('id', clientId);

  // unknown email still returns success (no enumeration)
  {
    const res = await post('/api/auth/forgot-password', { email: `nobody+${Date.now()}@nope.dev` });
    const body = await res.json();
    check('unknown email still returns success (no enumeration)', res.status === 200 && body.success === true);
  }

  // reset with wrong token fails
  {
    const res = await post('/api/auth/reset-password', { token: 'totally-wrong-token', password: NEW });
    check('reset with invalid token -> 400', res.status === 400, `got ${res.status}`);
  }

  // reset with too-short password fails
  {
    const res = await post('/api/auth/reset-password', { token, password: 'short' });
    check('reset with short password -> 400', res.status === 400, `got ${res.status}`);
  }

  // reset with valid token succeeds
  {
    const res = await post('/api/auth/reset-password', { token, password: NEW });
    check('reset with valid token -> success', res.status === 200, `got ${res.status}`);
  }

  // login with NEW password works
  {
    const res = await post('/api/auth/client-login', { email: EMAIL, password: NEW });
    check('login with new password works', res.status === 200, `got ${res.status}`);
  }

  // login with OLD password fails
  {
    const res = await post('/api/auth/client-login', { email: EMAIL, password: OLD });
    check('login with old password rejected (401)', res.status === 401, `got ${res.status}`);
  }

  // token is single-use: reusing it fails
  {
    const res = await post('/api/auth/reset-password', { token, password: 'anotherPass789' });
    check('reused token rejected (400)', res.status === 400, `got ${res.status}`);
  }

  // expired token is rejected
  {
    const expiredTok = crypto.randomBytes(32).toString('base64url');
    await sb.from('clients').update({
      reset_token: sha256(expiredTok),
      reset_token_expires: new Date(Date.now() - 60_000).toISOString(), // 1 min ago
    }).eq('id', clientId);
    const res = await post('/api/auth/reset-password', { token: expiredTok, password: 'expiredPass789' });
    check('expired token rejected (400)', res.status === 400, `got ${res.status}`);
  }
} catch (e) {
  fail++; failures.push(`crashed: ${e.message}`); console.error('SUITE ERROR:', e);
} finally {
  if (clientId) await sb.from('clients').delete().eq('id', clientId);
  await sb.from('auth_attempts').delete().gte('id', 0);
}

console.log(`\n== RESULT: ${pass} passed, ${fail} failed ==`);
if (failures.length) { console.log('Failures:', failures.join(' | ')); process.exit(1); }
