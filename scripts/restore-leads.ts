/**
 * Put back leads that are in a backup and no longer in the database.
 * Looks first, changes nothing unless --apply is given.
 *
 *   node --experimental-strip-types scripts/restore-leads.ts --from 2026-11-25
 *   node --experimental-strip-types scripts/restore-leads.ts --from 2026-11-25 --form <form id>
 *   node --experimental-strip-types scripts/restore-leads.ts --from 2026-11-25 --developer <developer id> --apply
 *
 * A lead is restored exactly as it was (same id, same date, same delivery and
 * handled state), and only if its form still exists. Leads whose form is gone
 * are counted and left alone. Nothing existing is overwritten.
 */
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { readBackup, missingLeads, listBackups, newestOfDay } from '../lib/backupCore.ts';

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

const arg = (name: string) => { const i = process.argv.indexOf(`--${name}`); return i > -1 ? process.argv[i + 1] : undefined; };
const from = arg('from');
const prefix = arg('prefix') ?? 'daily';
if (!from || !/^\d{4}-\d{2}-\d{2}$/.test(from)) {
  console.error('Usage: restore-leads.ts --from YYYY-MM-DD [--form <id>] [--developer <id>] [--apply]');
  process.exit(2);
}
const apply = process.argv.includes('--apply');

const file = newestOfDay((await listBackups(sb, prefix)).map((b) => b.name), from);
if (!file) { console.error(`No backup stored for ${from}. Run backup-now.ts --list to see what exists.`); process.exit(1); }
const backup = await readBackup(sb, file);
console.log(`Backup of ${backup.takenAt.slice(0, 16).replace('T', ' ')} UTC — ${backup.counts.submissions ?? 0} leads, ${backup.counts.forms ?? 0} forms`);

async function allIds(table: string): Promise<Set<string>> {
  const ids = new Set<string>();
  for (let start = 0; ; start += 1000) {
    const { data, error } = await sb.from(table).select('id').order('id').range(start, start + 999);
    if (error) throw new Error(`${table}: ${error.message}`);
    for (const r of data ?? []) ids.add(String(r.id));
    if (!data || data.length < 1000) return ids;
  }
}
const live = { leadIds: await allIds('submissions'), formIds: await allIds('forms') };
const diff = missingLeads(backup, live, { formId: arg('form'), developerId: arg('developer') });

const names = new Map((backup.tables.forms ?? []).map((f) => [String(f.id), String(f.name)]));
const byForm = new Map<string, number>();
for (const l of diff.restorable) byForm.set(String(l.form_id), (byForm.get(String(l.form_id)) ?? 0) + 1);
console.log(`Still in the database: ${diff.present}`);
console.log(`Missing and restorable: ${diff.restorable.length}`);
for (const [id, n] of byForm) console.log(`  ${names.get(id) ?? id}: ${n}`);
if (diff.orphaned) console.log(`Missing, but their form no longer exists (left alone): ${diff.orphaned}`);

if (!apply) {
  console.log(diff.restorable.length ? '\nNothing was changed. Add --apply to restore them.' : '\nNothing to restore.');
} else if (diff.restorable.length) {
  let done = 0;
  for (let i = 0; i < diff.restorable.length; i += 500) {
    const batch = diff.restorable.slice(i, i + 500);
    // ignoreDuplicates: a lead that reappeared meanwhile is left as it is
    const { error, count } = await sb.from('submissions').upsert(batch, { onConflict: 'id', ignoreDuplicates: true, count: 'exact' });
    if (error) { console.error(`Stopped after ${done}: ${error.message}`); process.exit(1); }
    done += count ?? batch.length;
  }
  console.log(`\nRestored ${done} lead(s).`);
}
