/**
 * Programmatic test suite: API keys + MCP server.
 * Run: node scripts/test-mcp.mjs [baseUrl]   (default http://localhost:3005)
 *
 * Phase 1 — no api_keys table required (auth walls, paywalls).
 * Phase 2 — full MCP flow (requires migration_v9 applied). Auto-skips with a
 *           clear message if the table is missing.
 * Cleans up everything it creates. Exits non-zero on any failure.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const BASE = process.argv[2] || 'http://localhost:3005';
const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter((l) => l && !l.trimStart().startsWith('#') && l.includes('='))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
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
  // SSE frame: take the last "data:" line
  const data = text.split('\n').filter((l) => l.startsWith('data:')).pop();
  return data ? JSON.parse(data.slice(5)) : null;
}

async function mcpCall(key, body) {
  const res = await fetch(`${BASE}/api/mcp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      ...(key ? { Authorization: `Bearer ${key}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return { status: res.status, json: await mcpParse(res).catch(() => null) };
}

const initMsg = {
  jsonrpc: '2.0', id: 1, method: 'initialize',
  params: { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'test-suite', version: '1.0' } },
};

const EMAIL = `mcptest+${Date.now()}@test.dev`;
let clientId = null;
let cookie = '';
let apiKey = null;
let formId = null;

async function cleanup() {
  try {
    if (clientId) {
      await sb.from('api_keys').delete().eq('client_id', clientId).throwOnError().then(() => {}, () => {});
      await sb.from('forms').delete().eq('client_id', clientId);
      await sb.from('clients').delete().eq('id', clientId);
    }
    await sb.from('auth_attempts').delete().gte('id', 0);
  } catch {}
}

try {
  console.log(`\n== Phase 1: auth walls (no api_keys table needed) — ${BASE} ==`);

  // 1. MCP without a key
  {
    const { status, json } = await mcpCall(null, initMsg);
    check('MCP rejects missing key with 401 + JSON-RPC error', status === 401 && json?.error?.code === -32001, `got ${status}`);
  }
  // 2. MCP with a garbage key
  {
    const { status } = await mcpCall('kef_garbage_key_that_does_not_exist', initMsg);
    check('MCP rejects invalid key with 401', status === 401, `got ${status}`);
  }
  // 3. Keys route unauthenticated
  {
    const res = await fetch(`${BASE}/api/client/keys`);
    check('Keys route rejects unauthenticated with 401', res.status === 401, `got ${res.status}`);
  }
  // 4. Free plan cannot create keys (paywall)
  {
    const res = await fetch(`${BASE}/api/auth/client-signup`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'MCP Test', email: EMAIL, password: 'testpass123' }),
    });
    cookie = (res.headers.getSetCookie?.() ?? []).map((c) => c.split(';')[0]).join('; ');
    const { data: c } = await sb.from('clients').select('id').eq('email', EMAIL).single();
    clientId = c?.id ?? null;
    check('signup for test client works', res.status === 200 && !!clientId, `got ${res.status}`);

    const keyRes = await fetch(`${BASE}/api/client/keys`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', cookie },
      body: JSON.stringify({ name: 'test' }),
    });
    const keyJson = await keyRes.json();
    check('free plan gets 402 paywall on key creation', keyRes.status === 402 && keyJson.paywall === true, `got ${keyRes.status}`);
  }

  // Detect api_keys table for Phase 2
  const { error: tableErr } = await sb.from('api_keys').select('id').limit(1);
  if (tableErr) {
    console.log(`\n== Phase 2 SKIPPED: api_keys table missing (run migrations/migration_v9_api_keys.sql) ==`);
    console.log(`   (${tableErr.message})`);
  } else {
    console.log(`\n== Phase 2: full MCP flow ==`);

    // upgrade to solo, create a key
    await sb.from('clients').update({ plan: 'solo' }).eq('id', clientId);
    const keyRes = await fetch(`${BASE}/api/client/keys`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', cookie },
      body: JSON.stringify({ name: 'suite' }),
    });
    const keyJson = await keyRes.json();
    apiKey = keyJson?.key?.raw ?? null;
    check('solo plan can create an API key (raw returned once)', keyRes.status === 200 && apiKey?.startsWith('kef_'), `got ${keyRes.status}`);

    // initialize handshake
    {
      const { status, json } = await mcpCall(apiKey, initMsg);
      check('MCP initialize returns serverInfo king-e-forms',
        status === 200 && json?.result?.serverInfo?.name === 'king-e-forms',
        `got ${status} ${JSON.stringify(json?.result?.serverInfo ?? json?.error ?? '')}`);
    }
    // tools/list
    {
      const { status, json } = await mcpCall(apiKey, { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} });
      const names = (json?.result?.tools ?? []).map((t) => t.name).sort();
      check('tools/list exposes the 4 tools',
        status === 200 && JSON.stringify(names) === JSON.stringify(['create_form', 'get_integration_snippet', 'get_submissions', 'list_forms']),
        `got ${JSON.stringify(names)}`);
    }
    // create_form
    {
      const { status, json } = await mcpCall(apiKey, {
        jsonrpc: '2.0', id: 3, method: 'tools/call',
        params: { name: 'create_form', arguments: { name: 'MCP suite form' } },
      });
      const textOut = json?.result?.content?.[0]?.text ?? '';
      formId = (textOut.match(/FORM_ID: ([0-9a-f-]{36})/) ?? [])[1] ?? null;
      check('create_form returns a FORM_ID', status === 200 && !!formId, `got ${status} "${textOut.slice(0, 80)}"`);
      if (formId) {
        const { data: f } = await sb.from('forms').select('client_id, auto_reply_enabled').eq('id', formId).single();
        check('created form exists in DB, owned by test client, auto-reply on',
          f?.client_id === clientId && f?.auto_reply_enabled === true);
      }
    }
    // get_submissions + tenant isolation
    if (formId) {
      const ok = await mcpCall(apiKey, {
        jsonrpc: '2.0', id: 4, method: 'tools/call',
        params: { name: 'get_submissions', arguments: { form_id: formId, limit: 5 } },
      });
      check('get_submissions works on own form', ok.status === 200 && (ok.json?.result?.content?.[0]?.text ?? '').includes('MCP suite form'));

      const foreign = await mcpCall(apiKey, {
        jsonrpc: '2.0', id: 5, method: 'tools/call',
        params: { name: 'get_submissions', arguments: { form_id: '00000000-0000-4000-8000-000000000000' } },
      });
      check('tenant isolation: foreign form id -> not found',
        (foreign.json?.result?.content?.[0]?.text ?? '').includes('not found'));
    }
    // plan gate after downgrade
    {
      await sb.from('clients').update({ plan: 'free' }).eq('id', clientId);
      const { status, json } = await mcpCall(apiKey, initMsg);
      check('downgraded plan is blocked with 403 plan gate', status === 403 && json?.error?.code === -32002, `got ${status}`);
      await sb.from('clients').update({ plan: 'solo' }).eq('id', clientId);
    }
    // revoked key
    {
      await sb.from('api_keys').update({ revoked: true }).eq('client_id', clientId);
      const { status } = await mcpCall(apiKey, initMsg);
      check('revoked key is rejected with 401', status === 401, `got ${status}`);
    }
  }
} catch (e) {
  fail++;
  failures.push(`suite crashed: ${e.message}`);
  console.error('SUITE ERROR:', e);
} finally {
  await cleanup();
}

console.log(`\n== RESULT: ${pass} passed, ${fail} failed ==`);
if (failures.length) { console.log('Failures:', failures.join(' | ')); process.exit(1); }
