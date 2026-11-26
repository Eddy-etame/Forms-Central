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

const DEV_EMAIL = `portaldev+${Date.now()}@test.invalid`;
const EC_EMAIL = `acme+${Date.now()}@test.invalid`;
const EC2_EMAIL = `beta+${Date.now()}@test.invalid`;
let developerId = null, devCookie = '', formId = null, form2Id = null, acmeId = null, betaId = null, portalCookie = '', fileObjectPath = null;
const otherDevs = [];

async function cleanup() {
  try {
    if (fileObjectPath) await sb.storage.from('uploads').remove([fileObjectPath]);
    for (const id of [developerId, ...otherDevs].filter(Boolean)) {
      const { data: forms } = await sb.from('forms').select('id').eq('client_id', id);
      for (const f of forms ?? []) { await sb.from('submissions').delete().eq('form_id', f.id); await sb.from('email_log').delete().eq('form_id', f.id); await sb.from('failures_log').delete().eq('form_id', f.id); }
      await sb.from('forms').delete().eq('client_id', id);
      await sb.from('portal_users').delete().eq('parent_client_id', id);
      await sb.from('clients').delete().eq('id', id);
    }
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
    const res3 = await post('/api/developer/clients', { name: 'Gamma', email: `gamma+${Date.now()}@test.invalid`, invite: false }, devCookie);
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
    // Hardening (2026-11-08): an empty origin list is refused instead of silently becoming `*`
    const res = await fetch(`${BASE}/api/developer/forms/${formId}`, { method: 'PATCH', headers: j(devCookie), body: JSON.stringify({ origins: [] }) });
    const b = await res.json().catch(() => ({}));
    check('form settings PATCH: empty origins → 400 ORIGINS_REQUIRED', res.status === 400 && b.code === 'ORIGINS_REQUIRED', `got ${res.status} ${b.code ?? ''}`);
  }
  {
    // webhooks only to public https hosts (loopback / private ranges refused)
    const bad = ['https://127.0.0.1/hook', 'https://10.0.0.8/hook', 'https://192.168.1.2/hook', 'https://169.254.169.254/latest', 'https://localhost/hook', 'https://user:pw@hooks.example/x', 'http://hooks.example/x'];
    const results = await Promise.all(bad.map((webhookUrl) => fetch(`${BASE}/api/developer/forms/${formId}`, { method: 'PATCH', headers: j(devCookie), body: JSON.stringify({ webhookUrl }) }).then((r) => r.status)));
    check('form settings PATCH: private / credentialed / plaintext webhook URLs → 400', results.every((st) => st === 400), `got ${results.join(',')}`);
    const good = await fetch(`${BASE}/api/developer/forms/${formId}`, { method: 'PATCH', headers: j(devCookie), body: JSON.stringify({ webhookUrl: 'https://hooks.example.com/inlet' }) });
    check('form settings PATCH: public https webhook accepted', good.status === 200, `got ${good.status}`);
  }
  {
    // a client's website is normalised to its origin; garbage is refused
    const bad = await fetch(`${BASE}/api/developer/clients`, { method: 'PATCH', headers: j(devCookie), body: JSON.stringify({ id: betaId, website: 'not a website' }) });
    const bb = await bad.json().catch(() => ({}));
    check('client PATCH: invalid website → 400 INVALID_WEBSITE', bad.status === 400 && bb.code === 'INVALID_WEBSITE', `got ${bad.status} ${bb.code ?? ''}`);
    const ok = await fetch(`${BASE}/api/developer/clients`, { method: 'PATCH', headers: j(devCookie), body: JSON.stringify({ id: betaId, website: 'beta.example/fr/contact' }) });
    const ob = await ok.json().catch(() => ({}));
    check('client PATCH: "beta.example/fr/contact" → https://beta.example', ok.status === 200 && ob.client?.website === 'https://beta.example', `got ${ok.status} ${ob.client?.website ?? ''}`);
    const created = await post('/api/developer/clients', { name: 'Delta', email: `delta+${Date.now()}@test.invalid`, website: 'ht!tp://', invite: false }, devCookie);
    const cb = await created.json().catch(() => ({}));
    check('client POST: invalid website → 400 INVALID_WEBSITE', created.status === 400 && cb.code === 'INVALID_WEBSITE', `got ${created.status} ${cb.code ?? ''}`);
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
    check('client sees its own form and lead', formNames.includes('Acme site') && leadNames.includes('Lead on Acme'), `status ${res.status} body ${JSON.stringify(b).slice(0, 200)}`);
    check('ISOLATION: client does NOT see the other client\'s form', !formNames.includes('Beta site') && !leadNames.includes('Lead on Beta'), `saw ${JSON.stringify(formNames)}`);
    const leadId = (b.leads ?? []).find((l) => l.payload?.name === 'Lead on Acme')?.id;
    const dl = await fetch(`${BASE}/api/download?sid=${leadId}&field=name`, { headers: { cookie: portalCookie } });
    check('download endpoint requires a file field (400, not 404/500) for the owner', dl.status === 400, `got ${dl.status}`);
    const dlNoAuth = await fetch(`${BASE}/api/download?sid=${leadId || '00000000-0000-4000-8000-000000000000'}&field=name`);
    check('download endpoint rejects anonymous callers (401)', dlNoAuth.status === 401, `got ${dlNoAuth.status}`);
  }
  {
    // Handled state (v23): a client marks its own request as handled and reopens it — never another client's.
    const mine = await (await fetch(`${BASE}/api/portal/leads`, { headers: j(portalCookie) })).json();
    const myLead = (mine.leads ?? []).find((l) => l.payload?.name === 'Lead on Acme');
    check('inbox exposes the handled state, a new request starts unhandled', mine.handledSupported === true && !!myLead && myLead.handled_at === null, JSON.stringify({ supported: mine.handledSupported, handled_at: myLead?.handled_at }));
    const patchLead = (body, cookie) => fetch(`${BASE}/api/portal/leads`, { method: 'PATCH', headers: j(cookie), body: JSON.stringify(body) });
    const done = await patchLead({ id: myLead.id, handled: true }, portalCookie);
    const db1 = await sb.from('submissions').select('handled_at, handled_by').eq('id', myLead.id).single();
    check('client marks its request as handled', done.status === 200 && !!db1.data?.handled_at && db1.data?.handled_by === 'client', `got ${done.status} ${JSON.stringify(db1.data)}`);
    const reopen = await patchLead({ id: myLead.id, handled: false }, portalCookie);
    const db2 = await sb.from('submissions').select('handled_at, handled_by').eq('id', myLead.id).single();
    check('client reopens it', reopen.status === 200 && db2.data?.handled_at === null && db2.data?.handled_by === null, `got ${reopen.status} ${JSON.stringify(db2.data)}`);
    const { data: other } = await sb.from('submissions').select('id').eq('form_id', form2Id).limit(1);
    const foreign = await patchLead({ id: other?.[0]?.id, handled: true }, portalCookie);
    const db3 = await sb.from('submissions').select('handled_at').eq('id', other?.[0]?.id).single();
    check("ISOLATION: a client cannot mark another client's request (404, untouched)", foreign.status === 404 && db3.data?.handled_at === null, `got ${foreign.status} ${JSON.stringify(db3.data)}`);
    const anonPatch = await patchLead({ id: myLead.id, handled: true });
    check('handled toggle rejects no session (401)', anonPatch.status === 401, `got ${anonPatch.status}`);
    const badPatch = await patchLead({ id: 'nope', handled: true }, portalCookie);
    check('handled toggle validates its input (400)', badPatch.status === 400, `got ${badPatch.status}`);
  }
  {
    const res = await fetch(`${BASE}/api/portal/leads`);
    check('portal leads rejects no session (401)', res.status === 401, `got ${res.status}`);
  }
  {
    // Attachments (2026-11-08): the bucket is private. A file arrives as a data URI, is stored
    // under a random name, and is readable only through /api/download by the lead's owners.
    const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    const body = new URLSearchParams({ name: 'File Lead', email: 'file@x.com', photo: `data:image/png;base64,${PNG.toString('base64')}` }).toString();
    const res = await fetch(`${BASE}/api/submit/${formId}`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Origin: 'https://acme.example', Referer: 'https://acme.example/contact' }, body });
    check('submit accepts a lead with a data-URI file (200)', res.status === 200, `got ${res.status}`);
    await new Promise((r) => setTimeout(r, 800));
    const { data: rows } = await sb.from('submissions').select('id, payload').eq('form_id', formId).order('created_at', { ascending: false }).limit(1);
    const fileLead = rows?.[0];
    const ref = String(fileLead?.payload?.photo ?? '');
    const m = ref.match(/\/storage\/v1\/object\/authenticated\/uploads\/(.+)$/);
    check('payload holds the authenticated reference, not a public link', !!m, ref.slice(0, 90));
    if (m) {
      fileObjectPath = decodeURIComponent(m[1]);
      const pub = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${m[1]}`);
      check('the object is NOT readable through the public storage URL', pub.status !== 200, `got ${pub.status}`);
      const dlDev = await fetch(`${BASE}/api/download?sid=${fileLead.id}&field=photo`, { headers: { cookie: devCookie } });
      const bytes = dlDev.ok ? Buffer.from(await dlDev.arrayBuffer()) : Buffer.alloc(0);
      check('the developer downloads it through /api/download (200, image/png, same bytes)', dlDev.status === 200 && (dlDev.headers.get('content-type') || '').includes('image/png') && bytes.equals(PNG), `got ${dlDev.status} ${dlDev.headers.get('content-type')} ${bytes.length}b`);
      const dlPortal = await fetch(`${BASE}/api/download?sid=${fileLead.id}&field=photo`, { headers: { cookie: portalCookie } });
      check('the client downloads it too (200)', dlPortal.status === 200, `got ${dlPortal.status}`);
      const dlAnon = await fetch(`${BASE}/api/download?sid=${fileLead.id}&field=photo`);
      check('anonymous download is refused (401)', dlAnon.status === 401, `got ${dlAnon.status}`);
    }
  }
  {
    // 2026-11-26: a reference typed into a form field used to be resolved by the server, with its
    // path decoded — `…/uploads/..%2Fbackups%2F<file>` reached the database backups. Now: a visitor's
    // storage link is removed on arrival, and a planted one already in the database resolves nothing.
    console.log(`\n== Attachment references cannot be planted ==`);
    const host = new URL(env.NEXT_PUBLIC_SUPABASE_URL).host;
    const { data: bk } = await sb.storage.from('backups').list('daily', { limit: 1, sortBy: { column: 'name', order: 'desc' } });
    const backupFile = bk?.[0]?.name ?? '2026-11-26T04-23-36Z.json.gz';
    const traversal = `https://${host}/storage/v1/object/authenticated/uploads/..%2Fbackups%2Fdaily%2F${backupFile}`;
    const foreign = `https://${host}/storage/v1/object/authenticated/uploads/1764045046123-0f1e2d3c4b5a6978.png`;
    const body = new URLSearchParams({ name: 'Planter', email: 'planter@selftest.invalid', photo: traversal, cv: foreign, message: `voir ${foreign} merci` }).toString();
    const res = await fetch(`${BASE}/api/submit/${formId}`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Origin: 'https://acme.example', Referer: 'https://acme.example/contact' }, body });
    await new Promise((r) => setTimeout(r, 600));
    const { data: rows } = await sb.from('submissions').select('id, payload').eq('form_id', formId).order('created_at', { ascending: false }).limit(1);
    const planted = rows?.[0];
    const stored = JSON.stringify(planted?.payload ?? {});
    check('a visitor’s storage links are removed before the lead is stored', res.status === 200 && planted?.payload?.name === 'Planter' && !stored.includes('/storage/v1/') && planted.payload.photo === '[storage link removed]' && planted.payload.message === 'voir [storage link removed] merci', stored.slice(0, 200));

    // The same references placed straight in the database, as a lead stored before the fix would hold them.
    const { data: old } = await sb.from('submissions').insert({ form_id: formId, payload: { name: 'Old planted', photo: traversal, cv: foreign }, ip_address: '127.0.0.1', fingerprint: 's' }).select('id').single();
    const t = await fetch(`${BASE}/api/download?sid=${old.id}&field=photo`, { headers: { cookie: devCookie } });
    const tBytes = (await t.arrayBuffer()).byteLength;
    check('the owner of a lead holding a traversal reference gets no file (400), not the backup', t.status === 400 && tBytes < 200, `got ${t.status}, ${tBytes} bytes`);
    const f = await fetch(`${BASE}/api/download?sid=${old.id}&field=cv`, { headers: { cookie: devCookie } });
    check('a well-formed reference to a file that is not there gives 404, never another object', f.status === 404, `got ${f.status}`);
    const viaPortal = await fetch(`${BASE}/api/download?sid=${old.id}&field=photo`, { headers: { cookie: portalCookie } });
    check('same refusal for the client of that form', viaPortal.status === 400, `got ${viaPortal.status}`);
    const exp = await fetch(`${BASE}/api/developer/leads/export?form=${formId}`, { headers: { cookie: `${devCookie}; inlet-locale=en` } });
    const expText = exp.ok ? await exp.text() : '';
    check('the export shows the traversal value as text, not as a download link', exp.status === 200 && expText.includes('..%2Fbackups%2F') && !expText.includes(`/api/download?sid=${old.id}&field=photo`), `status ${exp.status}`);
    await sb.from('submissions').delete().in('id', [old.id, planted?.id].filter(Boolean));
  }
  {
    const res = await post('/api/portal/forgot-password', { email: `nobody+${Date.now()}@test.invalid` });
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
    const otherEmail = `other+${Date.now()}@test.invalid`;
    const su = await post('/api/auth/developer-signup', { name: 'Other Dev', email: otherEmail, password: 'testpass123' });
    const otherCookie = setCookies(su).join('; ');
    const { data: oc } = await sb.from('clients').select('id').eq('email', otherEmail).single();
    if (oc?.id) otherDevs.push(oc.id);
    const res = await post('/api/developer/clients/assign', { formId, clientId: acmeId }, otherCookie);
    check('cross-tenant: another developer cannot touch this form (404)', res.status === 404, `got ${res.status}`);
    const inv = await post('/api/developer/clients/invite', { id: acmeId }, otherCookie);
    check('cross-tenant: another developer cannot invite this client (404)', inv.status === 404, `got ${inv.status}`);

    // Delivery state (v23, incident of 2026-11-24): a lead whose notification never left is
    // re-sent on demand, marked as delayed, by its own developer only. The client's address is a
    // reserved .invalid one, so the mail layer verifies the sending account instead of sending.
    console.log(`\n== Delivery state: a missed notification is re-sent, once, by its owner ==`);
    const tenMinAgo = new Date(Date.now() - 10 * 60_000).toISOString();
    const { data: missed } = await sb.from('submissions').insert({ form_id: formId, payload: { name: 'Missed Lead', email: 'missed@selftest.invalid', message: 'Nobody was told about me' }, ip_address: '127.0.0.1', fingerprint: 's', created_at: tenMinAgo }).select('id, notified_at').single();
    check('a lead starts without a delivery mark', !!missed?.id && missed.notified_at === null, JSON.stringify(missed));

    const anon = await post('/api/developer/leads/redeliver', { ids: [missed.id] });
    check('redeliver rejects no session (401)', anon.status === 401, `got ${anon.status}`);

    const foreign = await post('/api/developer/leads/redeliver', { ids: [missed.id] }, otherCookie);
    const fb = await foreign.json().catch(() => ({}));
    const { data: still } = await sb.from('submissions').select('notified_at, notify_attempts').eq('id', missed.id).single();
    check('cross-tenant: another developer cannot re-send this lead (nothing sent, lead untouched)', foreign.status === 200 && fb.sent === 0 && still?.notified_at === null && still?.notify_attempts === 0, `status ${foreign.status} ${JSON.stringify(fb)} ${JSON.stringify(still)}`);

    const own = await post('/api/developer/leads/redeliver', { ids: [missed.id] }, devCookie);
    const ob = await own.json().catch(() => ({}));
    const { data: done } = await sb.from('submissions').select('notified_at, notify_attempts').eq('id', missed.id).single();
    check('the owner re-sends it: reported sent, lead marked delivered', own.status === 200 && ob.sent === 1 && ob.failed === 0 && !!done?.notified_at && done?.notify_attempts === 1, `status ${own.status} ${JSON.stringify(ob)} ${JSON.stringify(done)}`);
    const { count: mails } = await sb.from('email_log').select('id', { count: 'exact', head: true }).eq('form_id', formId).eq('kind', 'lead');
    check('the delayed notification is in the e-mail log', (mails ?? 0) >= 1, `email_log lead rows: ${mails}`);

    const again = await post('/api/developer/leads/redeliver', { ids: [missed.id] }, devCookie);
    const ab = await again.json().catch(() => ({}));
    check('a second call sends nothing (no duplicate)', again.status === 200 && ab.sent === 0, JSON.stringify(ab));
  }
  {
    // Export (2026-11-24): one CSV holding EVERY lead (the old browser export stopped at the rows on
    // screen), safe to open in a spreadsheet, scoped to its owner. 1,005 rows cross the database's page size.
    console.log(`\n== Export: complete, safe in a spreadsheet, scoped to its owner ==`);
    const HOSTILE = '=HYPERLINK("http://evil.example","x")';
    await sb.from('submissions').insert({ form_id: formId, payload: { name: HOSTILE, email: 'evil@selftest.invalid', phone: '+33 6 12 34 56 78', message: 'ligne 1\nligne 2, avec "guillemets"' }, ip_address: '127.0.0.1', fingerprint: 's' });
    const bulk = Array.from({ length: 1005 }, (_, i) => ({ form_id: form2Id, payload: { name: `Bulk ${i}`, email: `bulk${i}@selftest.invalid` }, ip_address: '127.0.0.1', fingerprint: 's' }));
    const { error: bulkErr } = await sb.from('submissions').insert(bulk);
    check('test data: 1,005 leads inserted on the second form', !bulkErr, bulkErr?.message);
    const { count: total } = await sb.from('submissions').select('id', { count: 'exact', head: true }).in('form_id', [formId, form2Id]);
    const { count: totalBeta } = await sb.from('submissions').select('id', { count: 'exact', head: true }).eq('form_id', form2Id);
    const { count: totalAcme } = await sb.from('submissions').select('id', { count: 'exact', head: true }).eq('form_id', formId);

    /** Minimal RFC 4180 reader: records of cells, quotes doubled, line breaks allowed inside quotes. */
    const parseCsv = (text) => {
      const out = []; let row = [], cell = '', q = false;
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (q) { if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch; }
        else if (ch === '"') q = true;
        else if (ch === ',') { row.push(cell); cell = ''; }
        else if (ch === '\r') { /* part of CRLF */ }
        else if (ch === '\n') { row.push(cell); out.push(row); row = []; cell = ''; }
        else cell += ch;
      }
      if (cell !== '' || row.length) { row.push(cell); out.push(row); }
      return out;
    };

    const anon = await fetch(`${BASE}/api/developer/leads/export`);
    check('export rejects no session (401)', anon.status === 401, `got ${anon.status}`);

    // the developer's language is the request's: pin it so the column names are known
    const devEn = `${devCookie}; inlet-locale=en`;
    const res = await fetch(`${BASE}/api/developer/leads/export`, { headers: { cookie: devEn } });
    const raw = res.ok ? Buffer.from(await res.arrayBuffer()) : Buffer.alloc(0); // fetch's text() would swallow the byte-order mark
    const text = raw.toString('utf8');
    const recs = parseCsv(text.replace(/^\uFEFF/, ''));
    check('developer export: a CSV download (200, text/csv, attachment, never cached)', res.status === 200 && (res.headers.get('content-type') || '').startsWith('text/csv') && /attachment; filename="leads-\d{4}-\d{2}-\d{2}\.csv"/.test(res.headers.get('content-disposition') || '') && res.headers.get('cache-control') === 'no-store', `got ${res.status} ${res.headers.get('content-type')} ${res.headers.get('content-disposition')}`);
    check('it starts with the byte-order mark spreadsheets need for accents', raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf, raw.subarray(0, 3).toString('hex'));
    check(`it holds every lead, past the page size (${total} rows)`, recs.length === (total ?? -1) + 1 && Number(res.headers.get('x-inlet-rows')) === total, `records ${recs.length - 1}, header ${res.headers.get('x-inlet-rows')}, database ${total}`);
    check('every record has the same number of columns', recs.every((r) => r.length === recs[0].length), `header ${recs[0]?.length}`);
    const head = recs[0] ?? [];
    const col = (name) => head.indexOf(name);
    const hostile = recs.find((r) => r[col('email')] === 'evil@selftest.invalid');
    check('a formula typed by a visitor leaves as text', hostile?.[col('name')] === `'${HOSTILE}`, JSON.stringify(hostile?.[col('name')]));
    check('a phone number is left as it was typed', hostile?.[col('phone')] === '+33 6 12 34 56 78', JSON.stringify(hostile?.[col('phone')]));
    check('line breaks and quotes survive inside a cell', hostile?.[col('message')] === 'ligne 1\nligne 2, avec "guillemets"', JSON.stringify(hostile?.[col('message')]));
    check('each lead carries its form and its client', col('Client') > 0 && recs.some((r) => r[col('Form')] === 'Acme site' && r[col('Client')] === 'Acme Corp') && recs.some((r) => r[col('Form')] === 'Beta site' && r[col('Client')] === 'Beta SARL'), JSON.stringify(head.slice(0, 6)));
    const fileRec = recs.find((r) => r[col('name')] === 'File Lead');
    check('an attachment is exported as the session-checked download link', /^https?:\/\/[^/]+\/api\/download\?sid=[0-9a-f-]{36}&field=photo$/.test(fileRec?.[col('photo')] ?? ''), fileRec?.[col('photo')]);

    const one = await fetch(`${BASE}/api/developer/leads/export?form=${formId}`, { headers: { cookie: devEn } });
    const oneRecs = one.ok ? parseCsv((await one.text()).replace(/^\uFEFF/, '')) : [];
    check('export of one form holds that form only', one.status === 200 && oneRecs.length === (totalAcme ?? -1) + 1 && oneRecs.slice(1).every((r) => r[oneRecs[0].indexOf('Form')] === 'Acme site') && /filename="leads-acme-site-/.test(one.headers.get('content-disposition') || ''), `got ${one.status}, ${oneRecs.length - 1} rows, want ${totalAcme}`);

    // A second developer, created in the database and signed in with its password: sign-up is limited
    // to three accounts per ten minutes per address, and this suite already uses its share.
    const otherCookie = await (async () => {
      const email = `exporter+${Date.now()}@test.invalid`;
      const salt = crypto.randomBytes(16);
      const hash = `scrypt:16384:${salt.toString('hex')}:${crypto.scryptSync('testpass123', salt, 64, { N: 16384 }).toString('hex')}`;
      const { data: oc } = await sb.from('clients').insert({ name: 'Export Dev', email, plan: 'free', encrypted_password: hash }).select('id').single();
      if (oc?.id) otherDevs.push(oc.id);
      const li = await post('/api/auth/developer-login', { email, password: 'testpass123' });
      return setCookies(li).join('; ');
    })();
    const foreign = await fetch(`${BASE}/api/developer/leads/export?form=${formId}`, { headers: { cookie: otherCookie } });
    check('cross-tenant: another developer asking for this form gets 404', foreign.status === 404, `got ${foreign.status}`);
    const theirs = await fetch(`${BASE}/api/developer/leads/export`, { headers: { cookie: otherCookie } });
    const theirText = theirs.ok ? await theirs.text() : 'x';
    check('cross-tenant: their own export is empty and holds none of these leads', theirs.status === 200 && !theirText.includes('Bulk 1') && !theirText.includes('Lead on Acme') && parseCsv(theirText.replace(/^\uFEFF/, '')).length === 1, `got ${theirs.status}, ${theirText.length} chars`);

    const anonPortal = await fetch(`${BASE}/api/portal/leads/export`);
    check('client export rejects no session (401)', anonPortal.status === 401, `got ${anonPortal.status}`);
    const mine = await fetch(`${BASE}/api/portal/leads/export`, { headers: { cookie: portalCookie } });
    const mineRecs = mine.ok ? parseCsv((await mine.text()).replace(/^\uFEFF/, '')) : [];
    const mh = mineRecs[0] ?? [];
    check('client export: its own requests, all of them, with their status', mine.status === 200 && mineRecs.length === (totalAcme ?? -1) + 1 && mh.includes('Status') && !mh.includes('Client'), `got ${mine.status}, ${mineRecs.length - 1} rows, want ${totalAcme}, head ${JSON.stringify(mh.slice(0, 5))}`);
    check("ISOLATION: the client's export holds nothing of the other client", !mineRecs.some((r) => r.some((c) => c.startsWith('Bulk ') || c === 'Lead on Beta')), `(${totalBeta} rows on the other form)`);
  }
  {
    // 2026-11-26: a session token is a signed statement that lives seven days. The API used to check
    // only the signature, so a token kept working after sign-out, after a password reset, even after
    // the account was deleted. Every one of those must now end it — for developers and for clients.
    console.log(`\n== Sessions end when they should ==`);
    const scrypt = (pw) => { const salt = crypto.randomBytes(16); return `scrypt:16384:${salt.toString('hex')}:${crypto.scryptSync(pw, salt, 64, { N: 16384 }).toString('hex')}`; };
    const email = `sessions+${Date.now()}@test.invalid`;
    const { data: acct } = await sb.from('clients').insert({ name: 'Session Dev', email, plan: 'free', encrypted_password: scrypt('first-password-1') }).select('id').single();
    if (acct?.id) otherDevs.push(acct.id);
    const login = async (password) => { const r = await post('/api/auth/developer-login', { email, password }); return { status: r.status, cookie: setCookies(r).join('; ') }; };
    const whoami = (cookie) => fetch(`${BASE}/api/developer/clients`, { headers: j(cookie) }).then((r) => r.status);

    const a = await login('first-password-1');
    check('a developer signs in and the session opens the API', a.status === 200 && (await whoami(a.cookie)) === 200, `login ${a.status}`);
    const b = await login('first-password-1'); // a second device
    await fetch(`${BASE}/api/auth/logout`, { method: 'POST', headers: { cookie: a.cookie } });
    check('after sign-out, the same token no longer opens the API (401)', (await whoami(a.cookie)) === 401, `got ${await whoami(a.cookie)}`);
    check('…and the other device is not affected', (await whoami(b.cookie)) === 200);

    const rawReset = crypto.randomBytes(32).toString('base64url');
    await sb.from('clients').update({ reset_token: crypto.createHash('sha256').update(rawReset).digest('hex'), reset_token_expires: new Date(Date.now() + 3600_000).toISOString() }).eq('id', acct.id);
    await new Promise((r) => setTimeout(r, 1100)); // the cut-off is compared to the second
    const reset = await post('/api/auth/reset-password', { token: rawReset, password: 'second-password-2' });
    check('a password reset succeeds', reset.status === 200, `got ${reset.status}`);
    check('…and ends every session opened before it (401)', (await whoami(b.cookie)) === 401, `got ${await whoami(b.cookie)}`);
    check('the old password no longer signs in', (await login('first-password-1')).status === 401);
    const c = await login('second-password-2');
    check('the new password does, and its session works', c.status === 200 && (await whoami(c.cookie)) === 200, `login ${c.status}`);
    const again = await post('/api/auth/reset-password', { token: rawReset, password: 'third-password-3' });
    check('the reset link is single-use (400)', again.status === 400, `got ${again.status}`);

    await sb.from('clients').delete().eq('id', acct.id);
    check('a token whose account was deleted opens nothing (401)', (await whoami(c.cookie)) === 401, `got ${await whoami(c.cookie)}`);

    // the client side: choosing a new password ends the earlier client session
    const stillOpen = await fetch(`${BASE}/api/portal/leads`, { headers: j(portalCookie) });
    const raw2 = crypto.randomBytes(32).toString('base64url');
    await sb.from('portal_users').update({ invite_token_hash: crypto.createHash('sha256').update(raw2).digest('hex'), invite_expires: new Date(Date.now() + 3600_000).toISOString() }).eq('id', acmeId);
    await new Promise((r) => setTimeout(r, 1100));
    const setAgain = await post('/api/portal/set-password', { token: raw2, password: 'clientpass789' });
    const newPortalCookie = setCookies(setAgain).join('; ');
    const oldNow = await fetch(`${BASE}/api/portal/leads`, { headers: j(portalCookie) });
    const newNow = await fetch(`${BASE}/api/portal/leads`, { headers: j(newPortalCookie) });
    check('a client who chooses a new password: the earlier session ends (401), the new one works', stillOpen.status === 200 && setAgain.status === 200 && oldNow.status === 401 && newNow.status === 200, `before ${stillOpen.status}, set ${setAgain.status}, old ${oldNow.status}, new ${newNow.status}`);
    await sb.from('portal_users').delete().eq('id', acmeId).eq('parent_client_id', '00000000-0000-0000-0000-000000000000'); // no-op guard: the client is removed with its developer in cleanup
    const gone = await fetch(`${BASE}/api/portal/leads`, { headers: j(`portal_access_token=not.a.token`) });
    check('a made-up client token opens nothing (401)', gone.status === 401, `got ${gone.status}`);
  }
} catch (e) {
  fail++; failures.push(`suite crashed: ${e.message}`); console.error('SUITE ERROR:', e);
} finally {
  await cleanup();
}

console.log(`\n== RESULT: ${pass} passed, ${fail} failed ==`);
if (failures.length) { console.log('Failures:', failures.join(' | ')); process.exit(1); }
