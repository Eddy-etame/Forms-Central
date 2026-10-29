/**
 * Heavy test: the submission pipeline (the core engine).
 * Run: node scripts/test-submit.mjs [baseUrl]   (default http://localhost:3005)
 *
 * Drives the real path incl. proof-of-work and the API-key relay. Isolates
 * side effects behind a fake TEST-NET x-forwarded-for IP so honeypot/rate-limit
 * bans never touch real localhost. Needs migrations up to v22. Cleans up all
 * rows. Exits non-zero on any failure.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import crypto from 'node:crypto';

const BASE = process.argv[2] || 'http://localhost:3005';
const env = (() => {
  // .env.local when present (local dev); the process environment always wins (CI, cloud sessions)
  let fromFile = {};
  try {
    fromFile = Object.fromEntries(
      readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
        .split(/\r?\n/).filter((l) => l && !l.trimStart().startsWith('#') && l.includes('='))
        .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
    );
  } catch {}
  return { ...fromFile, ...process.env };
})();
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

let pass = 0, fail = 0; const failures = [];
const check = (n, ok, d = '') => ok ? (pass++, console.log(`  PASS  ${n}`)) : (fail++, failures.push(n), console.log(`  FAIL  ${n} ${d}`));
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');
const solvePow = (challenge, difficulty = 4) => { let n = 0; const p = '0'.repeat(difficulty); while (!sha256(`${challenge}:${n}`).startsWith(p)) n++; return String(n); };

const TEST_IP = `203.0.113.${10 + Math.floor(Math.random() * 200)}`; // TEST-NET-3, non-routable
const RELAY_VISITOR_IP = `203.0.113.${5}`;
const ALLOWED_ORIGIN = 'https://allowed.example';
let fpCounter = 0;
const baseHeaders = () => ({ 'x-forwarded-for': TEST_IP, 'x-client-fingerprint': `fp-${TEST_IP}-${fpCounter++}` });

let developerId = null, clientId = null, formId = null, inactiveFormId = null, rawKey = null;

async function countSubmissions(fid) {
  const { count } = await sb.from('submissions').select('id', { count: 'exact', head: true }).eq('form_id', fid);
  return count ?? 0;
}
async function latest(fid) {
  const { data } = await sb.from('submissions').select('id, payload, spam_status, spam_reason, ip_address').eq('form_id', fid).order('created_at', { ascending: false }).limit(1);
  return data?.[0] ?? null;
}
async function getChallenge() {
  const res = await fetch(`${BASE}/api/challenge`, { headers: baseHeaders() });
  return res.json();
}

async function cleanup() {
  try {
    await sb.from('blacklist').delete().eq('target', TEST_IP);
    await sb.from('blacklist').delete().eq('target', RELAY_VISITOR_IP);
    await sb.from('blacklist').delete().like('target', `fp-${TEST_IP}-%`);
    for (const fid of [formId, inactiveFormId].filter(Boolean)) {
      await sb.from('failures_log').delete().eq('form_id', fid);
      await sb.from('email_log').delete().eq('form_id', fid);
      await sb.from('submissions').delete().eq('form_id', fid);
    }
    if (developerId) {
      await sb.from('api_keys').delete().eq('client_id', developerId);
      await sb.from('forms').delete().eq('client_id', developerId);
      await sb.from('portal_users').delete().eq('parent_client_id', developerId);
      await sb.from('clients').delete().eq('id', developerId);
    }
  } catch (e) { console.error('cleanup error', e.message); }
}

try {
  console.log(`\n== Submit pipeline (heavy) — ${BASE} · test IP ${TEST_IP} ==`);
  await sb.from('blacklist').delete().eq('target', TEST_IP);

  // setup: developer + client (no e-mail sent: notify_leads=false) + active form (allowed origin) + inactive form + API key
  {
    const { data: d } = await sb.from('clients').insert({ name: 'Submit Test', email: `submit+${Date.now()}@test.dev`, plan: 'pro' }).select('id').single();
    developerId = d.id;
    const { data: c } = await sb.from('portal_users').insert({ parent_client_id: developerId, name: 'Submit Client', email: `submitclient+${Date.now()}@test.dev`, lang: 'fr', notify_leads: false }).select('id').single();
    clientId = c.id;
    const { data: f } = await sb.from('forms').insert({ name: 'Submit form', client_id: developerId, portal_user_id: clientId, is_active: true, allowed_origins: [ALLOWED_ORIGIN], notify_email: false, auto_reply_enabled: false }).select('id').single();
    formId = f.id;
    const { data: inf } = await sb.from('forms').insert({ name: 'Inactive form', client_id: developerId, portal_user_id: clientId, is_active: false, allowed_origins: ['*'], notify_email: false, auto_reply_enabled: false }).select('id').single();
    inactiveFormId = inf.id;
    rawKey = `kef_${crypto.randomBytes(32).toString('base64url')}`;
    await sb.from('api_keys').insert({ client_id: developerId, name: 'suite', key_hash: sha256(rawKey), key_prefix: rawKey.slice(0, 12) });
    check('setup: developer + client + active + inactive form + key', !!formId && !!inactiveFormId);
  }
  {
    const { error } = await sb.from('forms').insert({ name: 'Orphan', client_id: developerId, is_active: true, allowed_origins: ['*'] });
    check('DB refuses a form without a client (v22 NOT NULL)', !!error, 'insert succeeded');
  }

  // 1. Valid native (urlencoded, no origin, no PoW) -> stored
  {
    const before = await countSubmissions(formId);
    const res = await fetch(`${BASE}/api/submit/${formId}`, {
      method: 'POST', redirect: 'manual',
      headers: { ...baseHeaders(), 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ name: 'Native User', email: 'native@x.com', probe: crypto.randomUUID() }).toString(),
    });
    const after = await countSubmissions(formId);
    check('valid native submit stored (303 redirect)', (res.status === 303 || res.status === 200) && after === before + 1, `status ${res.status}, ${before}->${after}`);
  }

  // 2. Valid JSON submit WITH proof-of-work -> 200 + stored
  {
    const before = await countSubmissions(formId);
    const c = await getChallenge();
    const nonce = solvePow(c.challenge, c.difficulty ?? 4);
    const res = await fetch(`${BASE}/api/submit/${formId}`, {
      method: 'POST',
      headers: { ...baseHeaders(), 'Content-Type': 'application/json', Origin: ALLOWED_ORIGIN },
      body: JSON.stringify({ name: 'PoW User', email: 'pow@x.com', message: 'hello', _gotcha: '', _lang: 'en', pow_challenge: c.challenge, pow_timestamp: c.timestamp, pow_nonce: nonce }),
    });
    const body = await res.json().catch(() => ({}));
    const after = await countSubmissions(formId);
    check('valid JSON+PoW submit -> 200 success + stored', res.status === 200 && body.success === true && after === before + 1, `status ${res.status}, ${before}->${after}`);
    const row = await latest(formId);
    check('stored payload keeps the fields and drops the pow_* / _gotcha plumbing', row?.payload?.name === 'PoW User' && !('pow_nonce' in (row?.payload ?? {})) && !('_gotcha' in (row?.payload ?? {})), JSON.stringify(row?.payload));
  }

  // 3. JSON submit MISSING PoW params -> 400
  {
    const res = await fetch(`${BASE}/api/submit/${formId}`, {
      method: 'POST', headers: { ...baseHeaders(), 'Content-Type': 'application/json', Origin: ALLOWED_ORIGIN },
      body: JSON.stringify({ name: 'No PoW', email: 'nopow@x.com', _gotcha: '' }),
    });
    const body = await res.json().catch(() => ({}));
    check('JSON submit without PoW -> 400 POW_PARAMETERS_MISSING', res.status === 400 && body.code === 'POW_PARAMETERS_MISSING', `status ${res.status} code ${body.code}`);
  }

  // 4. JSON submit with a DISALLOWED Origin -> 403 CORS
  {
    const res = await fetch(`${BASE}/api/submit/${formId}`, {
      method: 'POST', headers: { ...baseHeaders(), 'Content-Type': 'application/json', Origin: 'https://evil.example' },
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

  // 7. API-key relay: disallowed Origin + no PoW, but a valid key -> trusted, stored, visitor IP forwarded
  {
    const before = await countSubmissions(formId);
    const res = await fetch(`${BASE}/api/submit/${formId}`, {
      method: 'POST',
      headers: { ...baseHeaders(), 'Content-Type': 'application/json', Origin: 'https://evil.example', Authorization: `Bearer ${rawKey}`, 'X-Inlet-Visitor-IP': RELAY_VISITOR_IP },
      body: JSON.stringify({ name: 'Relay User', email: 'relay@x.com', _gotcha: '' }),
    });
    const body = await res.json().catch(() => ({}));
    const after = await countSubmissions(formId);
    check('API-key relay waives CORS + PoW -> 200 + stored', res.status === 200 && body.success === true && after === before + 1, `status ${res.status} ${JSON.stringify(body).slice(0, 100)}`);
    const row = await latest(formId);
    check('relay stores the forwarded visitor IP, not the relay IP', row?.ip_address === RELAY_VISITOR_IP, `ip ${row?.ip_address}`);
    const bad = await fetch(`${BASE}/api/submit/${formId}`, {
      method: 'POST', headers: { ...baseHeaders(), 'Content-Type': 'application/json', Authorization: 'Bearer kef_not_a_real_key' },
      body: JSON.stringify({ name: 'x', _gotcha: '' }),
    });
    const badBody = await bad.json().catch(() => ({}));
    check('wrong API key -> 401 INVALID_API_KEY', bad.status === 401 && badBody.code === 'INVALID_API_KEY', `status ${bad.status} code ${badBody.code}`);
  }

  // 8. Spam keyword -> stored as SUSPECT (never dropped), visitor still sees success (court order A1)
  {
    const before = await countSubmissions(formId);
    const res = await fetch(`${BASE}/api/submit/${formId}`, {
      method: 'POST', redirect: 'manual',
      headers: { ...baseHeaders(), 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ name: 'Spammer', email: 's@x.com', message: 'cheap viagra and bitcoin casino' }).toString(),
    });
    const after = await countSubmissions(formId);
    const row = await latest(formId);
    check('keyword hit -> success to the visitor, STORED and flagged suspect', (res.status === 303 || res.status === 200) && after === before + 1 && row?.spam_status === 'suspect' && !!row?.spam_reason, `status ${res.status}, ${before}->${after}, status=${row?.spam_status}`);
  }

  // 9. Honeypot -> deceptive success, NOT stored, IP banned TEMPORARILY (LAST — bans TEST_IP)
  {
    const before = await countSubmissions(formId);
    const res = await fetch(`${BASE}/api/submit/${formId}`, {
      method: 'POST', redirect: 'manual',
      headers: { ...baseHeaders(), 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ name: 'Bot', email: 'bot@x.com', _gotcha: 'i-am-a-bot' }).toString(),
    });
    const after = await countSubmissions(formId);
    check('honeypot -> silent success, NOT stored', (res.status === 303 || res.status === 200) && after === before, `status ${res.status}, ${before}->${after}`);
    await new Promise((r) => setTimeout(r, 500)); // let the async ban land
    const { data: bl } = await sb.from('blacklist').select('id, expires_at').eq('target', TEST_IP).limit(1);
    check('honeypot banned the offending IP with an expiry (temporary, court order A2)', (bl?.length ?? 0) > 0 && !!bl[0].expires_at, JSON.stringify(bl));
  }
} catch (e) {
  fail++; failures.push(`crashed: ${e.message}`); console.error('SUITE ERROR:', e);
} finally {
  await cleanup();
}

console.log(`\n== RESULT: ${pass} passed, ${fail} failed ==`);
if (failures.length) { console.log('Failures:', failures.join(' | ')); process.exit(1); }
