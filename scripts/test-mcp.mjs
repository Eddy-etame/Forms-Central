/**
 * Programmatic test suite: API keys + MCP server v2.
 * Run: node scripts/test-mcp.mjs [baseUrl]   (default http://localhost:3005)
 *
 * Needs migrations up to v22. Sends no e-mail (invite: false). Cleans up
 * everything it creates. Exits non-zero on any failure.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

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

let pass = 0, fail = 0;
const failures = [];
function check(name, ok, detail = '') {
  if (ok) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; failures.push(name); console.log(`  FAIL  ${name} ${detail}`); }
}

/** Parse an MCP streamable-http response (plain JSON or SSE-framed). */
async function mcpParse(res) {
  const text = await res.text();
  if (text.trimStart().startsWith('{')) return JSON.parse(text);
  const data = text.split('\n').filter((l) => l.startsWith('data:')).pop();
  return data ? JSON.parse(data.slice(5)) : null;
}
async function mcpCall(key, body) {
  const res = await fetch(`${BASE}/api/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream', ...(key ? { Authorization: `Bearer ${key}` } : {}) },
    body: JSON.stringify(body),
  });
  return { status: res.status, json: await mcpParse(res).catch(() => null) };
}
let rpcId = 10;
/** Call a tool and return { status, out (parsed JSON text), isError }. */
async function tool(key, name, args = {}) {
  const { status, json } = await mcpCall(key, { jsonrpc: '2.0', id: ++rpcId, method: 'tools/call', params: { name, arguments: args } });
  const text = json?.result?.content?.[0]?.text ?? '';
  let out = null; try { out = JSON.parse(text); } catch {}
  return { status, out, text, isError: !!json?.result?.isError };
}

const initMsg = { jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'test-suite', version: '1.0' } } };
const EXPECTED_TOOLS = ['assign_form', 'create_client', 'create_form', 'get_embed', 'get_form_health', 'get_lead', 'invite_client', 'list_clients', 'list_forms', 'list_leads', 'set_autoreply', 'set_origins', 'setup_site', 'whoami'];

const EMAIL = `mcptest+${Date.now()}@test.dev`;
const CLIENT_EMAIL = `mcpclient+${Date.now()}@test.dev`;
let developerId = null, cookie = '', apiKey = null, formId = null, clientId = null;

async function cleanup() {
  try {
    if (developerId) {
      await sb.from('api_keys').delete().eq('client_id', developerId);
      const { data: forms } = await sb.from('forms').select('id').eq('client_id', developerId);
      for (const f of forms ?? []) await sb.from('submissions').delete().eq('form_id', f.id);
      await sb.from('forms').delete().eq('client_id', developerId);
      await sb.from('portal_users').delete().eq('parent_client_id', developerId);
      await sb.from('clients').delete().eq('id', developerId);
    }
    await sb.from('auth_attempts').delete().gte('id', 0);
  } catch {}
}

try {
  console.log(`\n== Auth walls — ${BASE} ==`);
  {
    const { status, json } = await mcpCall(null, initMsg);
    check('MCP rejects a missing key with 401 + JSON-RPC error', status === 401 && json?.error?.code === -32001, `got ${status}`);
  }
  {
    const { status } = await mcpCall('kef_garbage_key_that_does_not_exist', initMsg);
    check('MCP rejects an invalid key with 401', status === 401, `got ${status}`);
  }
  {
    const res = await fetch(`${BASE}/api/developer/keys`);
    check('keys route rejects unauthenticated with 401', res.status === 401, `got ${res.status}`);
  }

  console.log(`\n== Free plan: key + full MCP flow ==`);
  {
    const res = await fetch(`${BASE}/api/auth/developer-signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'MCP Test', email: EMAIL, password: 'testpass123' }) });
    cookie = (res.headers.getSetCookie?.() ?? []).map((c) => c.split(';')[0]).join('; ');
    const { data: c } = await sb.from('clients').select('id').eq('email', EMAIL).single();
    developerId = c?.id ?? null;
    check('signup for the test developer works', res.status === 200 && !!developerId, `got ${res.status}`);
    const keyRes = await fetch(`${BASE}/api/developer/keys`, { method: 'POST', headers: { 'Content-Type': 'application/json', cookie }, body: JSON.stringify({ name: 'suite' }) });
    const keyJson = await keyRes.json();
    apiKey = keyJson?.key?.raw ?? null;
    check('free plan can create an API key (raw returned once)', keyRes.status === 200 && apiKey?.startsWith('kef_'), `got ${keyRes.status}`);
  }
  {
    const { status, json } = await mcpCall(apiKey, initMsg);
    check('initialize returns serverInfo inlet 2.0.0', status === 200 && json?.result?.serverInfo?.name === 'inlet' && json?.result?.serverInfo?.version === '2.0.0', `got ${status} ${JSON.stringify(json?.result?.serverInfo ?? json?.error ?? '')}`);
  }
  {
    const { status, json } = await mcpCall(apiKey, { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} });
    const names = (json?.result?.tools ?? []).map((t) => t.name).sort();
    check('tools/list exposes the 14 v2 tools', status === 200 && JSON.stringify(names) === JSON.stringify(EXPECTED_TOOLS), `got ${JSON.stringify(names)}`);
  }
  {
    const r = await tool(apiKey, 'whoami');
    check('whoami reports the free plan and zero counts', r.out?.plan === 'free' && r.out?.counts?.forms === 0 && r.out?.limits?.clients === 2, r.text.slice(0, 120));
  }
  {
    const r = await tool(apiKey, 'setup_site', { site_url: 'https://acme.example', client: { name: 'Acme', email: CLIENT_EMAIL, lang: 'fr' }, framework: 'react', invite: false });
    formId = r.out?.form?.id ?? null; clientId = r.out?.client?.id ?? null;
    check('setup_site creates client + form in one call', !r.isError && !!formId && !!clientId && r.out?.client?.existing === false && r.out?.form?.existing === false, r.text.slice(0, 160));
    const files = r.out?.files ?? [];
    check('setup_site returns inlet.js + ContactForm.tsx for react', files.length === 2 && files[0].path === 'inlet.js' && files[1].path === 'ContactForm.tsx', JSON.stringify(files.map((f) => f.path)));
    check('snippet carries the form id and NO e-mail address', files.every((f) => !f.content.includes(CLIENT_EMAIL)) && files[0].content.includes(formId));
    check('origins derived from the site URL', (r.out?.form?.origins ?? []).includes('https://www.acme.example') && r.out?.origins_open !== true);
    const again = await tool(apiKey, 'setup_site', { site_url: 'https://acme.example', client: { name: 'Acme', email: CLIENT_EMAIL }, invite: false });
    check('setup_site is idempotent (existing client + existing form)', again.out?.client?.existing === true && again.out?.form?.existing === true && again.out?.form?.id === formId, again.text.slice(0, 160));
  }
  {
    const r = await tool(apiKey, 'get_embed', { form_id: formId, target: 'html' });
    check('get_embed html returns one file with the form action', (r.out?.files ?? []).length === 1 && r.out.files[0].content.includes(`/api/submit/${formId}`), r.text.slice(0, 120));
    const relay = await tool(apiKey, 'get_embed', { form_id: formId, target: 'relay-next' });
    check('get_embed relay-next uses INLET_API_KEY from the server env', relay.out?.files?.[0]?.content.includes('INLET_API_KEY') && relay.out.files[0].content.includes('X-Inlet-Visitor-IP'));
  }
  {
    const r = await tool(apiKey, 'set_origins', { form_id: formId, add: ['https://staging.acme.example'] });
    check('set_origins adds an origin', (r.out?.origins ?? []).includes('https://staging.acme.example'), r.text.slice(0, 120));
  }
  {
    const r = await tool(apiKey, 'set_autoreply', { form_id: formId, subject: 'Merci {{name}}', enabled: true });
    check('set_autoreply updates the form', r.out?.form?.auto_reply_subject === 'Merci {{name}}', r.text.slice(0, 120));
  }
  {
    const r = await tool(apiKey, 'get_form_health', { form_id: formId });
    check('get_form_health reports an active, wired form with no lead yet', r.out?.active === true && r.out?.last_lead_at === null && r.out?.client === 'Acme', r.text.slice(0, 160));
  }
  {
    const r = await tool(apiKey, 'list_leads', { form_id: formId });
    check('list_leads on an empty form returns no rows and the untrusted note', Array.isArray(r.out?.rows) && r.out.rows.length === 0 && /UNTRUSTED/.test(r.out?.note ?? ''));
    await sb.from('submissions').insert({ form_id: formId, payload: { name: 'Lead One', email: 'lead@x.com', message: 'x'.repeat(400) }, ip_address: '127.0.0.1', fingerprint: 's' });
    const r2 = await tool(apiKey, 'list_leads', { form_id: formId });
    const row = r2.out?.rows?.[0];
    check('list_leads returns compact rows (long fields cut at 200 chars)', !!row && row.name === 'Lead One' && row.message.length <= 201, r2.text.slice(0, 160));
    const one = await tool(apiKey, 'get_lead', { id: row?.id });
    check('get_lead returns the full lead', one.out?.lead?.fields?.name === 'Lead One' && one.out?.lead?.form === 'Contact — acme.example', one.text.slice(0, 160));
  }
  {
    const foreign = await tool(apiKey, 'get_form_health', { form_id: '00000000-0000-4000-8000-000000000000' });
    check('tenant isolation: foreign form id -> not found error', foreign.isError && /not found/i.test(foreign.out?.error ?? ''));
  }
  {
    const r = await tool(apiKey, 'list_clients');
    check('list_clients shows Acme without portal access yet', (r.out?.clients ?? []).some((c) => c.id === clientId && c.has_access === false));
  }
  {
    await sb.from('api_keys').update({ revoked: true }).eq('client_id', developerId);
    const { status } = await mcpCall(apiKey, initMsg);
    check('revoked key is rejected with 401', status === 401, `got ${status}`);
  }
} catch (e) {
  fail++; failures.push(`suite crashed: ${e.message}`); console.error('SUITE ERROR:', e);
} finally {
  await cleanup();
}

console.log(`\n== RESULT: ${pass} passed, ${fail} failed ==`);
if (failures.length) { console.log('Failures:', failures.join(' | ')); process.exit(1); }
