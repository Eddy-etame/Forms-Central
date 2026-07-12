/**
 * Heavy test: the submission pipeline (the core engine).
 * Run: node scripts/test-submit.mjs [baseUrl]   (default http://localhost:3005)
 *
 * Drives the real path incl. proof-of-work. Isolates side effects behind a
 * fake TEST-NET x-forwarded-for IP so honeypot/rate-limit blacklisting never
 * touches real localhost. Cleans up all rows (submissions, forms, client,
 * blacklist, failures_log). Exits non-zero on any failure.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import crypto from 'node:crypto';

const BASE = process.argv[2] || 'http://localhost:3005';
const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split(/\r?\n/).filter((l) => l && !l.trimStart().startsWith('#') && l.includes('='))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

let pass = 0, fail = 0; const failures = [];
const check = (n, ok, d = '') => ok ? (pass++, console.log(`  PASS  ${n}`)) : (fail++, failures.push(n), console.log(`  FAIL  ${n} ${d}`));
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');
const solvePow = (challenge) => { let n = 0; while (!sha256(`${challenge}:${n}`).startsWith('0000')) n++; return String(n); };

const TEST_IP = `203.0.113.${10 + Math.floor(Math.random() * 200)}`; // TEST-NET-3, non-routable
const ALLOWED_ORIGIN = 'https://allowed.example';
let fpCounter = 0;
const baseHeaders = () => ({ 'x-forwarded-for': TEST_IP, 'x-client-fingerprint': `fp-${TEST_IP}-${fpCounter++}` });

let clientId = null, formId = null, inactiveFormId = null;

async function countSubmissions(fid) {
  const { count } = await sb.from('submissions').select('id', { count: 'exact', head: true }).eq('form_id', fid);
  return count ?? 0;
}
async function getChallenge() {
  const res = await fetch(`${BASE}/api/challenge`, { headers: baseHeaders() });
  return res.json();
}

async function cleanup() {
  try {
    await sb.from('blacklist').delete().eq('target', TEST_IP);
    await sb.from('blacklist').delete().like('target', `fp-${TEST_IP}-%`);
    if (formId) { await sb.from('failures_log').delete().eq('form_id', formId); await sb.from('submissions').delete().eq('form_id', formId); }
    if (inactiveFormId) await sb.from('submissions').delete().eq('form_id', inactiveFormId);
    if (clientId) { await sb.from('forms').delete().eq('client_id', clientId); await sb.from('clients').delete().eq('id', clientId); }
  } catch (e) { console.error('cleanup error', e.message); }
}

try {
  console.log(`\n== Submit pipeline (heavy) — ${BASE} · test IP ${TEST_IP} ==`);
  // pre-clean any stale blacklist for this IP
  await sb.from('blacklist').delete().eq('target', TEST_IP);

  // setup: client + active form (allowed origin) + inactive form
  {
    const { data: c } = await sb.from('clients').insert({ name: 'Submit Test', email: `submit+${Date.now()}@test.dev`, plan: 'pro' }).select('id').single();
    clientId = c.id;
    const { data: f } = await sb.from('forms').insert({ name: 'Submit form', client_id: clientId, is_active: true, allowed_origins: [ALLOWED_ORIGIN], notify_email: false, auto_reply_enabled: false }).select('id').single();
    formId = f.id;
    const { data: inf } = await sb.from('forms').insert({ name: 'Inactive form', client_id: clientId, is_active: false, allowed_origins: ['*'] }).select('id').single();
    inactiveFormId = inf.id;
    check('setup: client + active + inactive form', !!formId && !!inactiveFormId);
  }

  // 1. Valid native (urlencoded, no origin, no PoW) -> stored
  {
    const before = await countSubmissions(formId);
    const probe = crypto.randomUUID();
    const res = await fetch(`${BASE}/api/submit/${formId}`, {
      method: 'POST', redirect: 'manual',
      headers: { ...baseHeaders(), 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ name: 'Native User', email: 'native@x.com', probe }).toString(),
    });
    const after = await countSubmissions(formId);
    check('valid native submit stored (303 redirect)', (res.status === 303 || res.status === 200) && after === before + 1, `status ${res.status}, ${before}->${after}`);
  }

  // 2. Valid JSON submit WITH proof-of-work -> 200 + stored
  {
    const before = await countSubmissions(formId);
    const c = await getChallenge();
    const nonce = solvePow(c.challenge);
    const res = await fetch(`${BASE}/api/submit/${formId}`, {
      method: 'POST',
      headers: { ...baseHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'PoW User', email: 'pow@x.com', message: 'hello', _gotcha: '', pow_challenge: c.challenge, pow_timestamp: c.timestamp, pow_nonce: nonce }),
    });
    const body = await res.json().catch(() => ({}));
    const after = await countSubmissions(formId);
    check('valid JSON+PoW submit -> 200 success + stored', res.status === 200 && body.success === true && after === before + 1, `status ${res.status}, ${before}->${after}`);
  }

  // 3. JSON submit MISSING PoW params -> 400
  {
    const res = await fetch(`${BASE}/api/submit/${formId}`, {
      method: 'POST',
      headers: { ...baseHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'No PoW', email: 'nopow@x.com', _gotcha: '' }),
    });
    const body = await res.json().catch(() => ({}));
    check('JSON submit without PoW -> 400 POW_PARAMETERS_MISSING', res.status === 400 && body.code === 'POW_PARAMETERS_MISSING', `status ${res.status} code ${body.code}`);
  }

  // 4. JSON submit with a DISALLOWED Origin -> 403 CORS
  {
    const res = await fetch(`${BASE}/api/submit/${formId}`, {
      method: 'POST',
      headers: { ...baseHeaders(), 'Content-Type': 'application/json', Origin: 'https://evil.example' },
      body: JSON.stringify({ name: 'CORS', email: 'cors@x.com', _gotcha: '' }),
    });
    const body = await res.json().catch(() => ({}));
    check('disallowed Origin -> 403 CORS_NOT_ALLOWED', res.status === 403 && body.code === 'CORS_NOT_ALLOWED', `status ${res.status} code ${body.code}`);
  }

  // 5. Non-existent form -> 404
  {
    const res = await fetch(`${BASE}/api/submit/00000000-0000-4000-8000-000000000000`, {
      method: 'POST', headers: { ...baseHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'x', _gotcha: '' }),
    });
    const body = await res.json().catch(() => ({}));
    check('unknown form -> 404 FORM_NOT_FOUND', res.status === 404 && body.code === 'FORM_NOT_FOUND', `status ${res.status} code ${body.code}`);
  }

  // 6. Inactive form -> 403
  {
    const res = await fetch(`${BASE}/api/submit/${inactiveFormId}`, {
      method: 'POST', headers: { ...baseHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'x', _gotcha: '' }),
    });
    const body = await res.json().catch(() => ({}));
    check('inactive form -> 403 FORM_INACTIVE', res.status === 403 && body.code === 'FORM_INACTIVE', `status ${res.status} code ${body.code}`);
  }

  // 7. Spam keyword -> deceptive success, NOT stored
  {
    const before = await countSubmissions(formId);
    const res = await fetch(`${BASE}/api/submit/${formId}`, {
      method: 'POST', redirect: 'manual',
      headers: { ...baseHeaders(), 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ name: 'Spammer', email: 's@x.com', message: 'cheap viagra and bitcoin casino' }).toString(),
    });
    const after = await countSubmissions(formId);
    check('spam keyword -> silent success, NOT stored', (res.status === 303 || res.status === 200) && after === before, `status ${res.status}, ${before}->${after}`);
  }

  // 8. Honeypot -> deceptive success, NOT stored, IP blacklisted (LAST — blacklists TEST_IP)
  {
    const before = await countSubmissions(formId);
    const res = await fetch(`${BASE}/api/submit/${formId}`, {
      method: 'POST', redirect: 'manual',
      headers: { ...baseHeaders(), 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ name: 'Bot', email: 'bot@x.com', _gotcha: 'i-am-a-bot' }).toString(),
    });
    const after = await countSubmissions(formId);
    check('honeypot -> silent success, NOT stored', (res.status === 303 || res.status === 200) && after === before, `status ${res.status}, ${before}->${after}`);
    await new Promise((r) => setTimeout(r, 400)); // let async blacklist write land
    const { data: bl } = await sb.from('blacklist').select('id').eq('target', TEST_IP).limit(1);
    check('honeypot blacklisted the offending IP', (bl?.length ?? 0) > 0);
  }
} catch (e) {
  fail++; failures.push(`crashed: ${e.message}`); console.error('SUITE ERROR:', e);
} finally {
  await cleanup();
}

console.log(`\n== RESULT: ${pass} passed, ${fail} failed ==`);
if (failures.length) { console.log('Failures:', failures.join(' | ')); process.exit(1); }
