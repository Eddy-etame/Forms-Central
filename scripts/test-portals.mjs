/**
 * Programmatic test suite: the client model (developer → clients → forms → inbox).
 * Run: node scripts/test-portals.mjs [baseUrl]   (default http://localhost:3005)
 *
 * Needs migrations up to v22 (portal_users.invite_token_hash, forms.portal_user_id NOT NULL).
 * Creates nothing that sends e-mail (invite: false). Cleans up everything.
 * Exits non-zero on any failure.
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
function check(name, ok, detail = '') {
  if (ok) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; failures.push(name); console.log(`  FAIL  ${name} ${detail}`); }
}
const setCookies = (res) => (res.headers.getSetCookie?.() ?? []).map((c) => c.split(';')[0]);
const j = (v) => ({ 'Content-Type': 'application/json', ...(v ? { cookie: v } : {}) });
const post = (path, body, cookie) => fetch(`${BASE}${path}`, { method: 'POST', headers: j(cookie), body: JSON.stringify(body) });

const DEV_EMAIL = `portaldev+${Date.now()}@test.dev`;
const EC_EMAIL = `acme+${Date.now()}@test.dev`;
const EC2_EMAIL = `beta+${Date.now()}@test.dev`;
let developerId = null, devCookie = '', formId = null, form2Id = null, acmeId = null, betaId = null, portalCookie = '';
const otherDevs = [];

async function cleanup() {
  try {
    for (const id of [developerId, ...otherDevs].filter(Boolean)) {
      const { data: forms } = await sb.from('forms').select('id').eq('client_id', id);
      for (const f of forms ?? []) await sb.from('submissions').delete().eq('form_id', f.id);
      await sb.from('forms').delete().eq('client_id', id);
      await sb.from('portal_users').delete().eq('parent_client_id', id);
      await sb.from('clients').delete().eq('id', id);
    }
    await sb.from('auth_attempts').delete().gte('id', 0);
  } catch {}
}

try {
  console.log(`\n== Developer signs up, creates clients — ${BASE} ==`);
  {
    const res = await post('/api/auth/developer-signup', { name: 'Portal Dev', email: DEV_EMAIL, password: 'testpass123' });
    devCookie = setCookies(res).join('; ');
    const { data: c } = await sb.from('clients').select('id, plan').eq('email', DEV_EMAIL).single();
    developerId = c?.id ?? null;
    check('developer signup works and lands on the free plan', res.status === 200 && !!developerId && c?.plan === 'free', `got ${res.status}`);
  }
  {
    const res = await fetch(`${BASE}/api/developer/clients`);
    check('clients route rejects unauthenticated (401)', res.status === 401, `got ${res.status}`);
  }
  {
    const res = await post('/api/developer/clients', { name: 'Acme Corp', email: EC_EMAIL, website: 'https://acme.example', lang: 'en', invite: false }, devCookie);
    const b = await res.json();
    acmeId = b.client?.id ?? null;
    check('free plan can create a client (no password anywhere in the response)', res.status === 200 && !!acmeId && b.invited === false && !('password' in b), `got ${res.status} ${JSON.stringify(b).slice(0, 120)}`);
    check('new client has no portal access yet', b.client?.has_access === false);
  }
  {
    const res = await post('/api/developer/clients', { name: 'Acme Corp again', email: EC_EMAIL.toUpperCase(), invite: false }, devCookie);
    const b = await res.json();
    check('same e-mail again -> 409 CLIENT_EXISTS with the existing client', res.status === 409 && b.code === 'CLIENT_EXISTS' && b.client?.id === acmeId, `got ${res.status}`);
  }
  {
    const res = await post('/api/developer/clients', { name: 'Beta SARL', email: EC2_EMAIL, lang: 'fr', invite: false }, devCookie);
    const b = await res.json();
    betaId = b.client?.id ?? null;
    check('second client created', res.status === 200 && !!betaId);
    const res3 = await post('/api/developer/clients', { name: 'Gamma', email: `gamma+${Date.now()}@test.dev`, invite: false }, devCookie);
    const b3 = await res3.json();
    check('third client on free -> 402 paywall (free = 2 clients)', res3.status === 402 && b3.paywall === true, `got ${res3.status}`);
  }

  console.log(`\n== Every form belongs to a client ==`);
  {
    const res = await post('/api/developer/forms', { name: 'Orphan form' }, devCookie);
    const b = await res.json();
    check('form without a client -> 400 CLIENT_REQUIRED', res.status === 400 && b.code === 'CLIENT_REQUIRED', `got ${res.status} ${b.code}`);
  }
  {
    const res = await post('/api/developer/forms', { name: 'Acme site', clientId: acmeId, siteUrl: 'https://acme.example' }, devCookie);
    const b = await res.json();
    formId = b.form?.id ?? null;
    const origins = b.form?.allowed_origins ?? [];
    check('form created under Acme', res.status === 200 && !!formId && b.form?.portal_user_id === acmeId, `got ${res.status}`);
    check('origins derived from the site URL (apex + www)', origins.includes('https://acme.example') && origins.includes('https://www.acme.example') && b.originsOpen === false, JSON.stringify(origins));
    check('form inherits the client language', b.lang === 'en');
  }
  {
    const res = await post('/api/developer/forms', { name: 'Beta site', clientId: betaId }, devCookie);
    const b = await res.json();
    form2Id = b.form?.id ?? null;
    check('form without site URL is open to any origin and says so', res.status === 200 && !!form2Id && b.originsOpen === true && (b.form?.allowed_origins ?? []).includes('*'));
  }
  {
    const res = await fetch(`${BASE}/api/developer/clients`, { headers: j(devCookie) });
    const b = await res.json();
    const acme = (b.clients ?? []).find((c) => c.id === acmeId);
    check('client list shows the forms of each client', res.status === 200 && (acme?.forms ?? []).some((f) => f.id === formId) && b.clientLimit === 2);
  }
  {
    const res = await fetch(`${BASE}/api/developer/forms/${formId}`, { method: 'PATCH', headers: j(devCookie), body: JSON.stringify({ origins: ['https://acme.example', 'https://staging.acme.example'], autoReply: { enabled: true, subject: 'Merci', message: 'Bonjour {{name}}' }, successUrl: 'https://acme.example/merci' }) });
    const b = await res.json();
    check('form settings PATCH (origins, auto-reply, success url)', res.status === 200 && (b.form?.allowed_origins ?? []).includes('https://staging.acme.example') && b.form?.success_url === 'https://acme.example/merci', `got ${res.status}`);
  }
  {
    const res = await fetch(`${BASE}/api/developer/clients`, { method: 'DELETE', headers: j(devCookie), body: JSON.stringify({ id: acmeId }) });
    const b = await res.json();
    check('deleting a client that still has forms -> 409 CLIENT_HAS_FORMS', res.status === 409 && b.code === 'CLIENT_HAS_FORMS', `got ${res.status}`);
  }

  console.log(`\n== Client inbox: set-password link, isolation ==`);
  await sb.from('submissions').insert([
    { form_id: formId, payload: { name: 'Lead on Acme', email: 'a@x.com' }, ip_address: '127.0.0.1', fingerprint: 's' },
    { form_id: form2Id, payload: { name: 'Lead on Beta', email: 'b@x.com' }, ip_address: '127.0.0.1', fingerprint: 's' },
  ]);
  const rawToken = crypto.randomBytes(32).toString('base64url');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  await sb.from('portal_users').update({ invite_token_hash: tokenHash, invite_expires: new Date(Date.now() + 3600_000).toISOString() }).eq('id', acmeId);
  {
    const res = await post('/api/portal/set-password', { token: rawToken, password: 'short' });
    check('set-password rejects a short password (400)', res.status === 400, `got ${res.status}`);
  }
  {
    const res = await post('/api/portal/set-password', { token: rawToken, password: 'clientpass123' });
    portalCookie = setCookies(res).join('; ');
    check('client sets a password from the link and is signed in', res.status === 200 && !!portalCookie, `got ${res.status}`);
    const again = await post('/api/portal/set-password', { token: rawToken, password: 'clientpass456' });
    check('the link is single-use (400 on reuse)', again.status === 400, `got ${again.status}`);
    const { data: pu } = await sb.from('portal_users').select('invite_token_hash, encrypted_password, last_login_at').eq('id', acmeId).single();
    check('token cleared, password stored hashed', pu?.invite_token_hash === null && typeof pu?.encrypted_password === 'string' && !pu.encrypted_password.includes('clientpass'));
  }
  {
    const res = await post('/api/portal/login', { email: EC_EMAIL, password: 'clientpass123' });
    check('client can log in with the chosen password', res.status === 200, `got ${res.status}`);
    const bad = await post('/api/portal/login', { email: EC_EMAIL, password: 'wrongwrong' });
    check('wrong password -> 401', bad.status === 401, `got ${bad.status}`);
  }
  {
    const res = await fetch(`${BASE}/api/portal/leads`, { headers: j(portalCookie) });
    const b = await res.json();
    const formNames = (b.forms ?? []).map((f) => f.name);
    const leadNames = (b.leads ?? []).map((l) => l.payload?.name);
    check('client sees its own form and lead', formNames.includes('Acme site') && leadNames.includes('Lead on Acme'));
    check('ISOLATION: client does NOT see the other client\'s form', !formNames.includes('Beta site') && !leadNames.includes('Lead on Beta'), `saw ${JSON.stringify(formNames)}`);
    const leadId = (b.leads ?? []).find((l) => l.payload?.name === 'Lead on Acme')?.id;
    const dl = await fetch(`${BASE}/api/download?sid=${leadId}&field=name`, { headers: { cookie: portalCookie } });
    check('download endpoint requires a file field (400, not 404/500) for the owner', dl.status === 400, `got ${dl.status}`);
    const dlNoAuth = await fetch(`${BASE}/api/download?sid=${leadId}&field=name`);
    check('download endpoint rejects anonymous callers (401)', dlNoAuth.status === 401, `got ${dlNoAuth.status}`);
  }
  {
    const res = await fetch(`${BASE}/api/portal/leads`);
    check('portal leads rejects no session (401)', res.status === 401, `got ${res.status}`);
  }
  {
    const res = await post('/api/portal/forgot-password', { email: `nobody+${Date.now()}@test.dev` });
    check('forgot-password never reveals whether an e-mail exists (200)', res.status === 200, `got ${res.status}`);
  }
  {
    const res = await post('/api/developer/clients/assign', { formId, clientId: betaId }, devCookie);
    check('move form Acme site to Beta', res.status === 200, `got ${res.status}`);
    const leads = await (await fetch(`${BASE}/api/portal/leads`, { headers: j(portalCookie) })).json();
    check('after the move, Acme sees zero forms', (leads.forms ?? []).length === 0);
    await post('/api/developer/clients/assign', { formId, clientId: acmeId }, devCookie);
  }
  {
    const otherEmail = `other+${Date.now()}@test.dev`;
    const su = await post('/api/auth/developer-signup', { name: 'Other Dev', email: otherEmail, password: 'testpass123' });
    const otherCookie = setCookies(su).join('; ');
    const { data: oc } = await sb.from('clients').select('id').eq('email', otherEmail).single();
    if (oc?.id) otherDevs.push(oc.id);
    const res = await post('/api/developer/clients/assign', { formId, clientId: acmeId }, otherCookie);
    check('cross-tenant: another developer cannot touch this form (404)', res.status === 404, `got ${res.status}`);
    const inv = await post('/api/developer/clients/invite', { id: acmeId }, otherCookie);
    check('cross-tenant: another developer cannot invite this client (404)', inv.status === 404, `got ${inv.status}`);
  }
} catch (e) {
  fail++; failures.push(`suite crashed: ${e.message}`); console.error('SUITE ERROR:', e);
} finally {
  await cleanup();
}

console.log(`\n== RESULT: ${pass} passed, ${fail} failed ==`);
if (failures.length) { console.log('Failures:', failures.join(' | ')); process.exit(1); }
