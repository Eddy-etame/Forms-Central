/**
 * Take a backup now, from a terminal: before a migration, a risky query, or
 * to check that backups work. Same code as the daily job (lib/backupCore.ts):
 * the file is read back and compared before the script says it succeeded.
 *
 *   node --experimental-strip-types scripts/backup-now.ts            today's daily file
 *   node --experimental-strip-types scripts/backup-now.ts --list     what is stored
 *
 * Uses NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (environment, else .env.local).
 */
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { takeBackup, listBackups, BACKUP_KEEP } from '../lib/backupCore.ts';

const env: Record<string, string | undefined> = (() => {
  let fromFile: Record<string, string> = {};
  try {
    fromFile = Object.fromEntries(
      readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
        .split(/\r?\n/).filter((l) => l && !l.trimStart().startsWith('#') && l.includes('='))
        .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
    );
  } catch { /* no file: the environment has them */ }
  return { ...fromFile, ...process.env };
})();
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

if (process.argv.includes('--list')) {
  const files = await listBackups(sb);
  if (files.length === 0) console.log('No backup stored yet.');
  for (const f of files) console.log(`  ${f.name}  ${f.bytes === null ? '' : `${(f.bytes / 1024).toFixed(1)} kB`}`);
  console.log(`\n${files.length} file(s); ${BACKUP_KEEP} days are kept.`);
} else {
  const r = await takeBackup(sb, new Date());
  console.log(`Backup written and read back: ${r.name} (${(r.bytes / 1024).toFixed(1)} kB)`);
  for (const [t, n] of Object.entries(r.counts)) console.log(`  ${t.padEnd(20)} ${n}`);
  console.log(`${r.kept} file(s) stored${r.removed.length ? `, ${r.removed.length} older than ${BACKUP_KEEP} days removed` : ''}.`);
}
