/**
 * Move the whole database + uploads bucket from one Supabase project to
 * another (e.g. from the school account to the company account).
 *
 *   OLD_SUPABASE_URL=… OLD_SUPABASE_SERVICE_ROLE_KEY=… \
 *   NEW_SUPABASE_URL=… NEW_SUPABASE_SERVICE_ROLE_KEY=… \
 *   node scripts/migrate-supabase.mjs [--dry-run] [--skip-files]
 *
 * Before running:
 *   1. In the NEW project, run migrations/schema.sql then every migration in
 *      migrations/README.md order (v22 included) and create a public bucket
 *      named `uploads`.
 *   2. Run scripts/backup-supabase.mjs against the OLD project.
 *
 * What it does, in dependency order: copies every table row by row (upsert on
 * id, so it is safe to re-run), rewrites attachment URLs inside submission
 * payloads from the old storage host to the new one, then copies the files.
 * Nothing is deleted from the old project.
 */
import { createClient } from '@supabase/supabase-js';

const need = (k) => { const v = process.env[k]; if (!v) { console.error(`Missing ${k}`); process.exit(1); } return v; };
const OLD_URL = need('OLD_SUPABASE_URL'), OLD_KEY = need('OLD_SUPABASE_SERVICE_ROLE_KEY');
const NEW_URL = need('NEW_SUPABASE_URL'), NEW_KEY = need('NEW_SUPABASE_SERVICE_ROLE_KEY');
const DRY = process.argv.includes('--dry-run');
const SKIP_FILES = process.argv.includes('--skip-files');

const src = createClient(OLD_URL, OLD_KEY, { auth: { persistSession: false } });
const dst = createClient(NEW_URL, NEW_KEY, { auth: { persistSession: false } });

// Parents before children (foreign keys).
const ORDER = [
  'clients', 'portal_users', 'forms', 'api_keys', 'submissions', 'email_log', 'failures_log',
  'blacklist', 'ai_usage', 'auth_attempts', 'security_events', 'device_sessions',
  'webhook_deliveries', 'plan_requests',
];
const oldStorage = `${OLD_URL.replace(/\/$/, '')}/storage/v1/object/`;
const newStorage = `${NEW_URL.replace(/\/$/, '')}/storage/v1/object/`;

function rewriteUrls(value) {
  if (typeof value === 'string') return value.split(oldStorage).join(newStorage);
  if (Array.isArray(value)) return value.map(rewriteUrls);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, rewriteUrls(v)]));
  return value;
}

async function readAll(table) {
  const rows = []; const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await src.from(table).select('*').range(from, from + PAGE - 1);
    if (error) { if (/does not exist|relation|schema cache/i.test(error.message)) return null; throw new Error(`${table}: ${error.message}`); }
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }
  return rows;
}

for (const table of ORDER) {
  const rows = await readAll(table);
  if (rows === null) { console.log(`  ${table.padEnd(20)} absent in source — skipped`); continue; }
  const shaped = table === 'submissions' ? rows.map((r) => ({ ...r, payload: rewriteUrls(r.payload) })) : rows;
  if (DRY) { console.log(`  ${table.padEnd(20)} ${rows.length} rows (dry run)`); continue; }
  for (let i = 0; i < shaped.length; i += 500) {
    const chunk = shaped.slice(i, i + 500);
    const { error } = await dst.from(table).upsert(chunk, { onConflict: 'id' });
    if (error) {
      if (/does not exist|relation|schema cache/i.test(error.message)) { console.log(`  ${table.padEnd(20)} absent in target — run the migrations first`); break; }
      throw new Error(`${table} chunk ${i}: ${error.message}`);
    }
  }
  console.log(`  ${table.padEnd(20)} ${rows.length} rows copied`);
}

if (!SKIP_FILES) {
  const files = [];
  async function walk(prefix = '') {
    const { data, error } = await src.storage.from('uploads').list(prefix, { limit: 1000 });
    if (error) { console.log(`  uploads: ${error.message}`); return; }
    for (const item of data ?? []) {
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id === null) await walk(path); else files.push(path);
    }
  }
  await walk();
  console.log(`  uploads bucket       ${files.length} files${DRY ? ' (dry run)' : ''}`);
  if (!DRY) {
    for (const path of files) {
      const { data, error } = await src.storage.from('uploads').download(path);
      if (error) { console.log(`  ! ${path}: ${error.message}`); continue; }
      const { error: upErr } = await dst.storage.from('uploads').upload(path, data, { upsert: true, contentType: data.type || undefined });
      if (upErr) console.log(`  ! ${path}: ${upErr.message}`);
    }
    console.log('  files copied');
  }
}

console.log(`\n✓ ${DRY ? 'Dry run finished' : 'Migration finished'}. Next: point NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY at the new project, redeploy, then test a submission.`);
