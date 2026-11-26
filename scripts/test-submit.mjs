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

let developerId = null, clientId = null, formId = null, inactiveFormId = null, notifyFormId = null, rawKey = null, realIp = null, directFp = null, honeypotBanIds = [];

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
    if (realIp) await sb.from('blacklist').delete().eq('target', realIp);
    if (honeypotBanIds.length) await sb.from('blacklist').delete().in('id', honeypotBanIds);
    if (directFp) await sb.from('blacklist').delete().eq('target', directFp);
    await sb.from('blacklist').delete().eq('target', RELAY_VISITOR_IP);
    await sb.from('blacklist').delete().like('target', `fp-${TEST_IP}-%`);
    for (const fid of [formId, inactiveFormId, notifyFormId].filter(Boolean)) {
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

  // setup: developer + client (notify_leads=false: these leads notify nobody; 8b covers notifications) + active form (allowed origin) + inactive form + API key
  {
    const { data: d } = await sb.from('clients').insert({ name: 'Submit Test', email: `submit+${Date.now()}@test.invalid`, plan: 'pro' }).select('id').single();
    developerId = d.id;
    const { data: c } = await sb.from('portal_users').insert({ parent_client_id: developerId, name: 'Submit Client', email: `submitclient+${Date.now()}@test.invalid`, lang: 'fr', notify_leads: false }).select('id').single();
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

  // 8a. A real prospect of a web studio or an estate agent is not labelled (2026-11-25: "seo" and
  //     "investment" are ordinary words in those enquiries)
  {
    const res = await fetch(`${BASE}/api/submit/${formId}`, {
      method: 'POST', redirect: 'manual',
      headers: { ...baseHeaders(), 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ name: 'Real Prospect', email: 'prospect@selftest.invalid', message: 'Bonjour, je cherche une refonte de mon site avec un bon SEO. We also need a page about our investment property.' }).toString(),
    });
    const row = await latest(formId);
    check('an enquiry about SEO or an investment property is stored without a spam label', (res.status === 303 || res.status === 200) && row?.payload?.name === 'Real Prospect' && !row?.spam_status, `status ${res.status}, spam_status=${row?.spam_status}`);
  }

  // 8b. Notifications really leave (regression: Nov 2026 — every lead e-mail was dropped because the
  //     work ran after the response without being tracked). The client and the visitor use reserved
  //     .invalid addresses: the mail layer verifies the sending account's login instead of sending,
  //     then logs the e-mail exactly as for a real one. So a row in email_log proves the whole path:
  //     recipients → tracked task → SMTP login accepted → log.
  {
    const stamp = Date.now();
    const { data: nc } = await sb.from('portal_users').insert({ parent_client_id: developerId, name: 'Notify Client', email: `notify+${stamp}@selftest.invalid`, lang: 'en', notify_leads: true }).select('id').single();
    const { data: nf } = await sb.from('forms').insert({ name: 'Notify form', client_id: developerId, portal_user_id: nc.id, is_active: true, allowed_origins: ['*'], notify_email: false, auto_reply_enabled: true, auto_reply_subject: 'Nous avons bien reçu votre message', auto_reply_message: '' }).select('id').single();
    notifyFormId = nf.id;
    const startedAt = new Date().toISOString();
    const res = await fetch(`${BASE}/api/submit/${notifyFormId}`, {
      method: 'POST', redirect: 'manual',
      headers: { ...baseHeaders(), 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ name: 'Notify Probe', email: `visitor+${stamp}@selftest.invalid`, message: 'Does the client hear about this lead?', _lang: 'en' }).toString(),
    });
    check('notification probe: lead accepted', res.status === 303 || res.status === 200, `status ${res.status}`);
    let kinds = [];
    for (let i = 0; i < 30; i++) {
      const { data } = await sb.from('email_log').select('kind').eq('form_id', notifyFormId);
      kinds = (data ?? []).map((r) => r.kind);
      if (kinds.includes('lead') && kinds.includes('auto_reply')) break;
      await new Promise((r) => setTimeout(r, 1000));
    }
    const { data: fails } = await sb.from('failures_log').select('error_type, error_message').eq('form_id', notifyFormId);
    const { data: acct } = await sb.from('failures_log').select('error_message').like('error_type', 'SMTP_A%').is('form_id', null).gte('created_at', startedAt);
    const dead = [...new Set((acct ?? []).map((r) => String(r.error_message).split(' ')[0]))].sort();
    if (dead.length) console.log(`        sending accounts that refused the login during this probe: ${dead.join(', ')}`);
    check('the client notification was handed to the mail server and logged', kinds.includes('lead'), `email_log kinds: [${kinds.join(',')}] · failures: ${JSON.stringify(fails ?? [])}`);
    check('the visitor auto-reply was handed to the mail server and logged', kinds.includes('auto_reply'), `email_log kinds: [${kinds.join(',')}] · failures: ${JSON.stringify(fails ?? [])}`);
    check('no delivery failure recorded for the probe', (fails ?? []).filter((f) => f.error_type.startsWith('SMTP')).length === 0, JSON.stringify(fails ?? []));
  }

  // 9. Honeypot -> deceptive success, NOT stored, visitor IP banned TEMPORARILY (LAST — bans TEST_IP).
  //    Behind Vercel a spoofed x-forwarded-for is ignored, so the visitor IP is pinned through the
  //    trusted relay header — otherwise the ban would land on the test runner's own address.
  {
    const before = await countSubmissions(formId);
    const res = await fetch(`${BASE}/api/submit/${formId}`, {
      method: 'POST', redirect: 'manual',
      headers: { ...baseHeaders(), 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Bearer ${rawKey}`, 'X-Inlet-Visitor-IP': TEST_IP },
      body: new URLSearchParams({ name: 'Bot', email: 'bot@x.com', _gotcha: 'i-am-a-bot' }).toString(),
    });
    const after = await countSubmissions(formId);
    check('honeypot -> silent success, NOT stored', (res.status === 303 || res.status === 200) && after === before, `status ${res.status}, ${before}->${after}`);
    await new Promise((r) => setTimeout(r, 500));
    // 2026-11-26: a relay only CLAIMS its visitor's address, and the ban list is shared by every form
    // of every developer. Nothing a relay says may put an address on it.
    const { data: bl } = await sb.from('blacklist').select('id').eq('target', TEST_IP).limit(1);
    check('honeypot through a key relay: the claimed address is NOT put on the shared ban list', (bl?.length ?? 0) === 0, JSON.stringify(bl));
  }

  // 9b. A direct visitor who fills the honeypot IS banned — by the address the platform saw, for a
  //     day — and never by the browser fingerprint, which is a header the sender writes.
  //     This bans the test runner's own address, and its host name when the runner sits at a hosting
  //     provider. Both are lifted in the same breath (and again in cleanup). The rows are found by
  //     when they were written, not by an address learned earlier: a runner may leave through
  //     several addresses, and until 2026-11-26 the host ban was left behind — the next run, arriving
  //     from that host, was refused on every post.
  {
    directFp = `fp-direct-${Date.now()}`;
    const before = await countSubmissions(formId);
    const t0 = new Date(Date.now() - 2000).toISOString();
    const res = await fetch(`${BASE}/api/submit/${formId}`, {
      method: 'POST', redirect: 'manual',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Origin: ALLOWED_ORIGIN, Referer: `${ALLOWED_ORIGIN}/contact`, 'x-client-fingerprint': directFp },
      body: new URLSearchParams({ name: 'Bot', email: 'bot@x.com', _gotcha: 'i-am-a-bot' }).toString(),
    });
    const after = await countSubmissions(formId);
    await new Promise((r) => setTimeout(r, 1500)); // the host lookup is bounded at 1.5 s
    const { data: written } = await sb.from('blacklist').select('id, target, type, expires_at').gte('created_at', t0).like('reason', 'Honeypot Triggered%');
    honeypotBanIds = (written ?? []).map((r) => r.id);
    const ipBan = (written ?? []).filter((r) => r.type === 'ip');
    const hostBan = (written ?? []).filter((r) => r.type === 'host');
    const { data: fpBan } = await sb.from('blacklist').select('id').eq('target', directFp).limit(1);
    if (honeypotBanIds.length) await sb.from('blacklist').delete().in('id', honeypotBanIds);
    realIp = ipBan[0]?.target ?? null;
    check('honeypot -> silent success, NOT stored', (res.status === 303 || res.status === 200) && after === before, `status ${res.status}, ${before}->${after}`);
    check('a direct honeypot hit bans the address the platform saw, with an expiry (temporary, court order A2)', ipBan.length === 1 && !!ipBan[0].expires_at, `ip bans written: ${ipBan.length}`);
    check('…its host name too, at most once and never without an expiry', hostBan.length <= 1 && hostBan.every((r) => !!r.expires_at), `host bans written: ${hostBan.length}`);
    check('…and never the fingerprint the sender wrote', (fpBan?.length ?? 0) === 0 && !(written ?? []).some((r) => r.type === 'fingerprint'), JSON.stringify(fpBan));
    const { data: left } = honeypotBanIds.length ? await sb.from('blacklist').select('id').in('id', honeypotBanIds) : { data: [] };
    check('the suite leaves no ban behind', (left?.length ?? 0) === 0, `left: ${left?.length}`);
  }
} catch (e) {
  fail++; failures.push(`crashed: ${e.message}`); console.error('SUITE ERROR:', e);
} finally {
  await cleanup();
}

console.log(`\n== RESULT: ${pass} passed, ${fail} failed ==`);
if (failures.length) { console.log('Failures:', failures.join(' | ')); process.exit(1); }
