/**
 * Live test of the backup and the way back, against the real database and storage.
 * Run: node --experimental-strip-types scripts/test-backup-live.ts
 *
 * Creates one test developer with a form and three leads, takes a backup under
 * the `selftest/` prefix (never the daily files), deletes two leads, restores
 * them with the same code the restore script uses, and compares. Cleans up
 * everything it created, including its backup file.
 */
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { takeBackup, readBackup, listBackups, missingLeads, BACKUP_BUCKET, BACKUP_TABLES } from '../lib/backupCore.ts';

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

let pass = 0, fail = 0;
const failures: string[] = [];
const check = (name: string, ok: boolean, detail = '') =>
  ok ? (pass++, console.log(`  PASS  ${name}`)) : (fail++, failures.push(name), console.log(`  FAIL  ${name} ${detail}`));

const stamp = Date.now();
let developerId: string | null = null;
let backupFile: string | null = null;
const extraFiles: string[] = [];

try {
  console.log('\n== Backup: written, read back, private ==');
  const { data: dev } = await sb.from('clients').insert({ name: 'Backup Selftest', email: `backupdev+${stamp}@test.invalid`, plan: 'free' }).select('id').single();
  developerId = dev?.id ?? null;
  const { data: client } = await sb.from('portal_users').insert({ parent_client_id: developerId, name: 'Selftest Client', email: `backupclient+${stamp}@test.invalid` }).select('id').single();
  const { data: form } = await sb.from('forms').insert({ name: 'Selftest form', client_id: developerId, portal_user_id: client?.id, allowed_origins: ['*'], is_active: true }).select('id').single();
  const formId = form?.id as string;
  const { data: leads } = await sb.from('submissions').insert([
    { form_id: formId, payload: { name: 'Zoé', message: 'été à Besançon — "devis"' }, ip_address: '127.0.0.1', fingerprint: 's', handled_at: new Date(stamp - 3600_000).toISOString(), handled_by: 'client', notified_at: new Date(stamp - 7200_000).toISOString(), notify_attempts: 1 },
    // a bulk insert needs the same keys on every row
    { form_id: formId, payload: { name: 'Second' }, ip_address: '127.0.0.1', fingerprint: 's', handled_at: null, handled_by: null, notified_at: null, notify_attempts: 0 },
    { form_id: formId, payload: { name: 'Third' }, ip_address: '127.0.0.1', fingerprint: 's', handled_at: null, handled_by: null, notified_at: null, notify_attempts: 0 },
  ]).select('*');
  check('test data in place (developer, client, form, 3 leads)', !!developerId && !!formId && leads?.length === 3);

  const result = await takeBackup(sb, new Date(), { prefix: 'selftest' });
  backupFile = result.name;
  check('a backup is written and verified', result.bytes > 0 && BACKUP_TABLES.every((t) => typeof result.counts[t] === 'number'), JSON.stringify(result.counts));
  const { count: liveLeads } = await sb.from('submissions').select('id', { count: 'exact', head: true });
  check('it holds every lead in the database', result.counts.submissions === liveLeads, `backup ${result.counts.submissions}, database ${liveLeads}`);
  const { data: bucket } = await sb.storage.getBucket(BACKUP_BUCKET);
  check('the bucket is private', bucket?.public === false);
  const pub = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BACKUP_BUCKET}/${result.name}`);
  check('the file cannot be fetched through a public link', pub.status !== 200, `got ${pub.status}`);
  const listed = await listBackups(sb, 'selftest');
  check('it appears in the listing with its size', listed.some((f) => f.name === result.name && (f.bytes ?? 0) > 0), JSON.stringify(listed));
  // A second backup right after the first must not be confused with it (storage is cached by name).
  await new Promise((r) => setTimeout(r, 1100));
  await sb.from('submissions').insert({ form_id: formId, payload: { name: 'Arrived between two backups' }, ip_address: '127.0.0.1', fingerprint: 's' });
  const second = await takeBackup(sb, new Date(), { prefix: 'selftest' });
  extraFiles.push(second.name);
  check('a second backup the same day is its own file and verifies against itself', second.name !== result.name && second.counts.submissions === result.counts.submissions + 1, `${second.name} ${second.counts.submissions} vs ${result.counts.submissions}`);

  console.log('\n== The way back ==');
  const kept = leads![0], lost = [leads![1], leads![2]];
  await sb.from('submissions').delete().in('id', lost.map((l) => l.id));
  const backup = await readBackup(sb, result.name);
  const ids = async (table: string) => new Set(((await sb.from(table).select('id').limit(100000)).data ?? []).map((r) => String(r.id)));
  const diff = missingLeads(backup, { leadIds: await ids('submissions'), formIds: await ids('forms') }, { developerId: developerId! });
  check('exactly the two deleted leads are found missing', diff.restorable.length === 2 && diff.restorable.every((l) => lost.some((x) => x.id === l.id)) && diff.present === 1, `restorable ${diff.restorable.length}, present ${diff.present}`);
  const { error: upErr } = await sb.from('submissions').upsert(diff.restorable, { onConflict: 'id', ignoreDuplicates: true });
  const { data: after } = await sb.from('submissions').select('*').eq('form_id', formId).in('id', leads!.map((l) => l.id)).order('created_at');
  const same = (a: Record<string, unknown>, b: Record<string, unknown>) => Object.keys(a).every((k) => JSON.stringify(a[k]) === JSON.stringify(b[k]));
  check('they come back exactly as they were (same id, date, content, state)', !upErr && after?.length === 3 && leads!.every((l) => { const r = after!.find((x) => x.id === l.id); return !!r && same(l, r); }), upErr?.message ?? `${after?.length} rows`);
  const again = missingLeads(backup, { leadIds: await ids('submissions'), formIds: await ids('forms') }, { developerId: developerId! });
  check('a second pass finds nothing left to restore', again.restorable.length === 0 && again.present === 3, `restorable ${again.restorable.length}, present ${again.present}`);
  const foreign = missingLeads(backup, { leadIds: new Set(), formIds: await ids('forms') }, { developerId: developerId! });
  check('scoped to one developer: only that developer’s leads are ever proposed', foreign.restorable.length === 3 && foreign.restorable.every((l) => l.form_id === formId), `${foreign.restorable.length} proposed`);
  void kept;
} catch (e) {
  fail++; failures.push(`suite crashed: ${(e as Error).message}`); console.error('SUITE ERROR:', e);
} finally {
  if (backupFile) await sb.storage.from(BACKUP_BUCKET).remove([backupFile, ...extraFiles]);
  if (developerId) {
    const { data: forms } = await sb.from('forms').select('id').eq('client_id', developerId);
    for (const f of forms ?? []) await sb.from('submissions').delete().eq('form_id', f.id);
    await sb.from('forms').delete().eq('client_id', developerId);
    await sb.from('portal_users').delete().eq('parent_client_id', developerId);
    await sb.from('clients').delete().eq('id', developerId);
  }
}

console.log(`\n== RESULT: ${pass} passed, ${fail} failed ==`);
if (fail) { console.log('Failures:', failures.join(' | ')); process.exit(1); }
