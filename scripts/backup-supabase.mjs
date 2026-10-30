/**
 * Back up every table (and the `uploads` bucket listing) of the Supabase
 * project in .env.local to backups/<timestamp>/ as JSON.
 *
 *   node scripts/backup-supabase.mjs            # tables only
 *   node scripts/backup-supabase.mjs --files    # also download the uploads bucket
 *
 * backups/ is gitignored. Run this BEFORE a migration, a project move, or any
 * risky SQL. Nothing is written to the database.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const env = (() => {
  // .env.local when present; the process environment always wins (CI, cloud sessions)
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
const URL_ = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_ || !KEY) { console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY'); process.exit(1); }
const sb = createClient(URL_, KEY, { auth: { persistSession: false } });

// Order does not matter for a backup; it does for a restore (see migrate-supabase.mjs).
export const TABLES = [
  'clients', 'portal_users', 'forms', 'submissions', 'email_log', 'api_keys', 'blacklist',
  'failures_log', 'ai_usage', 'auth_attempts', 'security_events', 'device_sessions',
  'webhook_deliveries', 'plan_requests',
];

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const dir = join(process.cwd(), 'backups', stamp);
mkdirSync(dir, { recursive: true });

async function dumpTable(table) {
  const rows = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await sb.from(table).select('*').range(from, from + PAGE - 1);
    if (error) {
      if (/does not exist|relation|schema cache/i.test(error.message)) return null; // table not in this project
      throw new Error(`${table}: ${error.message}`);
    }
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }
  writeFileSync(join(dir, `${table}.json`), JSON.stringify(rows, null, 1));
  return rows.length;
}

const summary = {};
for (const t of TABLES) {
  const n = await dumpTable(t);
  summary[t] = n === null ? 'absent' : n;
  console.log(`  ${t.padEnd(20)} ${n === null ? '(absent)' : n}`);
}

// Storage: list (and optionally download) the uploads bucket.
const files = [];
async function walk(prefix = '') {
  const { data, error } = await sb.storage.from('uploads').list(prefix, { limit: 1000 });
  if (error) { console.log(`  uploads bucket: ${error.message}`); return; }
  for (const item of data ?? []) {
    const path = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.id === null) await walk(path); // folder
    else files.push({ path, size: item.metadata?.size ?? null, updated_at: item.updated_at });
  }
}
await walk();
writeFileSync(join(dir, 'uploads.index.json'), JSON.stringify(files, null, 1));
console.log(`  uploads bucket       ${files.length} files`);

if (process.argv.includes('--files')) {
  mkdirSync(join(dir, 'uploads'), { recursive: true });
  for (const f of files) {
    const { data, error } = await sb.storage.from('uploads').download(f.path);
    if (error) { console.log(`  ! ${f.path}: ${error.message}`); continue; }
    const target = join(dir, 'uploads', f.path);
    mkdirSync(join(target, '..'), { recursive: true });
    writeFileSync(target, Buffer.from(await data.arrayBuffer()));
  }
  console.log('  files downloaded');
}

writeFileSync(join(dir, 'summary.json'), JSON.stringify({ at: stamp, source: new URL(URL_).host, tables: summary, files: files.length }, null, 2));
console.log(`\n✓ Backup written to ${dir}`);
