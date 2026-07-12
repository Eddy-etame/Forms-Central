/**
 * Programmatic test suite: client portals (developer -> end-client).
 * Run: node scripts/test-portals.mjs [baseUrl]   (default http://localhost:3005)
 *
 * Phase 1 — plan gate + auth walls (works without migration_v10).
 * Phase 2 — full flow + ISOLATION (needs migrations/migration_v10_portals.sql).
 * Cleans up everything. Exits non-zero on any failure.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const BASE = process.argv[2] || 'http://localhost:3005';
const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split(/\r?\n/).filter((l) => l && !l.trimStart().startsWith('#') && l.includes('='))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

let pass = 0, fail = 0; const failures = [];
function check(name, ok, detail = '') {
  if (ok) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; failures.push(name); console.log(`  FAIL  ${name} ${detail}`); }
}
const setCookies = (res) => (res.headers.getSetCookie?.() ?? []).map((c) => c.split(';')[0]);
const j = (v) => ({ 'Content-Type': 'application/json', ...(v ? { cookie: v } : {}) });

const DEV_EMAIL = `portaldev+${Date.now()}@test.dev`;
const EC_EMAIL = `endclient+${Date.now()}@test.dev`;
let clientId = null, devCookie = '', formId = null, form2Id = null, ecId = null, ecPassword = null, portalCookie = '';

async function cleanup() {
  try {
    if (clientId) {
      await sb.from('portal_users').delete().eq('parent_client_id', clientId).then(() => {}, () => {});
      await sb.from('forms').delete().eq('client_id', clientId);
      await sb.from('clients').delete().eq('id', clientId);
    }
    await sb.from('auth_attempts').delete().gte('id', 0);
  } catch {}
}

try {
  console.log(`\n== Phase 1: plan gate — ${BASE} ==`);
  // signup developer (starts free)
  {
    const res = await fetch(`${BASE}/api/auth/client-signup`, {
      method: 'POST', headers: j(), body: JSON.stringify({ name: 'Portal Dev', email: DEV_EMAIL, password: 'testpass123' }),
    });
    devCookie = setCookies(res).join('; ');
    const { data: c } = await sb.from('clients').select('id').eq('email', DEV_EMAIL).single();
    clientId = c?.id ?? null;
    check('developer signup works', res.status === 200 && !!clientId, `got ${res.status}`);
  }
  // portal-users unauthenticated
  {
    const res = await fetch(`${BASE}/api/client/portal-users`);
    check('portal-users rejects unauthenticated (401)', res.status === 401, `got ${res.status}`);
  }
  // free plan blocked
  {
    const res = await fetch(`${BASE}/api/client/portal-users`, {
      method: 'POST', headers: j(devCookie), body: JSON.stringify({ name: 'Acme', email: EC_EMAIL }),
    });
    const body = await res.json();
    check('free plan gets 402 paywall on end-client creation', res.status === 402 && body.paywall === true, `got ${res.status}`);
  }

  // Detect portal_users table for Phase 2
  const { error: tableErr } = await sb.from('portal_users').select('id').limit(1);
  if (tableErr) {
    console.log(`\n== Phase 2 SKIPPED: portal_users table missing (run migrations/migration_v10_portals.sql) ==`);
    console.log(`   (${tableErr.message})`);
  } else {
    console.log(`\n== Phase 2: full flow + isolation ==`);
    await sb.from('clients').update({ plan: 'solo' }).eq('id', clientId);

    // create two forms
    for (const nm of ['Client A site', 'Client B site']) {
      const res = await fetch(`${BASE}/api/client/forms`, { method: 'POST', headers: j(devCookie), body: JSON.stringify({ name: nm }) });
      const b = await res.json();
      if (nm === 'Client A site') formId = b.form?.id; else form2Id = b.form?.id;
    }
    check('developer created two forms', !!formId && !!form2Id);

    // create end-client
    {
      const res = await fetch(`${BASE}/api/client/portal-users`, {
        method: 'POST', headers: j(devCookie), body: JSON.stringify({ name: 'Acme Corp', email: EC_EMAIL }),
      });
      const b = await res.json();
      ecId = b.portalUser?.id; ecPassword = b.password;
      check('solo plan creates an end-client (password returned once)', res.status === 200 && !!ecId && !!ecPassword, `got ${res.status}`);
    }
    // assign form A to end-client
    {
      const res = await fetch(`${BASE}/api/client/portal-users/assign`, {
        method: 'POST', headers: j(devCookie), body: JSON.stringify({ portalUserId: ecId, formId }),
      });
      check('assign form A to end-client', res.status === 200);
    }
    // seed one submission on each form
    await sb.from('submissions').insert([
      { form_id: formId, payload: { name: 'Lead on A', email: 'a@x.com' }, ip_address: '127.0.0.1', fingerprint: 's' },
      { form_id: form2Id, payload: { name: 'Lead on B', email: 'b@x.com' }, ip_address: '127.0.0.1', fingerprint: 's' },
    ]);

    // end-client login
    {
      const res = await fetch(`${BASE}/api/portal/login`, {
        method: 'POST', headers: j(), body: JSON.stringify({ email: EC_EMAIL, password: ecPassword }),
      });
      portalCookie = setCookies(res).join('; ');
      check('end-client can log in', res.status === 200 && !!portalCookie, `got ${res.status}`);
    }
    // end-client wrong password
    {
      const res = await fetch(`${BASE}/api/portal/login`, {
        method: 'POST', headers: j(), body: JSON.stringify({ email: EC_EMAIL, password: 'wrongwrong' }),
      });
      check('end-client wrong password -> 401', res.status === 401, `got ${res.status}`);
    }
    // end-client reads leads: sees ONLY form A
    {
      const res = await fetch(`${BASE}/api/portal/leads`, { headers: j(portalCookie) });
      const b = await res.json();
      const formNames = (b.forms ?? []).map((f) => f.name);
      const leadNames = (b.leads ?? []).map((l) => l.payload?.name);
      check('end-client sees assigned form A', formNames.includes('Client A site') && leadNames.includes('Lead on A'));
      check('ISOLATION: end-client does NOT see unassigned form B', !formNames.includes('Client B site') && !leadNames.includes('Lead on B'),
        `saw forms=${JSON.stringify(formNames)}`);
    }
    // portal leads with no session
    {
      const res = await fetch(`${BASE}/api/portal/leads`);
      check('portal leads rejects no session (401)', res.status === 401, `got ${res.status}`);
    }
    // unassign, end-client sees nothing
    {
      await fetch(`${BASE}/api/client/portal-users/assign`, {
        method: 'POST', headers: j(devCookie), body: JSON.stringify({ formId, assign: false }),
      });
      const res = await fetch(`${BASE}/api/portal/leads`, { headers: j(portalCookie) });
      const b = await res.json();
      check('after unassign, end-client sees zero forms', (b.forms ?? []).length === 0);
    }
    // cross-tenant: another developer cannot assign to this end-client
    {
      const otherEmail = `other+${Date.now()}@test.dev`;
      const su = await fetch(`${BASE}/api/auth/client-signup`, { method: 'POST', headers: j(), body: JSON.stringify({ name: 'Other Dev', email: otherEmail, password: 'testpass123' }) });
      const otherCookie = setCookies(su).join('; ');
      const { data: oc } = await sb.from('clients').select('id').eq('email', otherEmail).single();
      await sb.from('clients').update({ plan: 'solo' }).eq('id', oc.id);
      // other dev tries to assign THEIR nonexistent form to OUR end-client -> form not found (scoped)
      const res = await fetch(`${BASE}/api/client/portal-users/assign`, {
        method: 'POST', headers: j(otherCookie), body: JSON.stringify({ portalUserId: ecId, formId }),
      });
      check('cross-tenant assign blocked (form not found under other dev)', res.status === 404, `got ${res.status}`);
      await sb.from('clients').delete().eq('id', oc.id);
    }
  }
} catch (e) {
  fail++; failures.push(`suite crashed: ${e.message}`); console.error('SUITE ERROR:', e);
} finally {
  await cleanup();
}

console.log(`\n== RESULT: ${pass} passed, ${fail} failed ==`);
if (failures.length) { console.log('Failures:', failures.join(' | ')); process.exit(1); }
