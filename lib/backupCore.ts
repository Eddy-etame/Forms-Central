/**
 * Daily backup of the data nobody can re-create — accounts, clients, forms,
 * leads — to a private storage bucket, and the way back from it.
 *
 * Why: twice in a month this product nearly lost what it exists to keep (a
 * retention run that purged leads, then seventeen days of silent mail
 * failures). Until 2026-11-25 a backup existed only when somebody ran a
 * script by hand. Now one is taken every day, read back and compared before
 * it counts, kept for BACKUP_KEEP days, and retention refuses to delete
 * anything unless a verified one is less than a day old.
 *
 * The database client is passed in, so the same code serves the scheduled
 * route (app client) and the terminal scripts (their own client). The only
 * imports are Node's zlib and a type.
 *
 * Not covered: attachment files (they already live in storage, in the same
 * project) and operational logs. A copy outside this project is the next step.
 */
import { gzipSync, gunzipSync } from 'node:zlib';
import type { SupabaseClient } from '@supabase/supabase-js';

export const BACKUP_BUCKET = 'backups';
/** Days of backups kept. Also the longest a deleted lead survives in a backup. */
export const BACKUP_KEEP = 14;
/** A backup older than this no longer vouches for a deletion. */
export const BACKUP_FRESH_MS = 26 * 3_600_000;

export const BACKUP_TABLES = ['clients', 'portal_users', 'forms', 'api_keys', 'submissions', 'plan_requests', 'retention_notices', 'blacklist'] as const;

type Row = Record<string, unknown>;

export interface BackupFile {
  version: 1;
  takenAt: string;
  counts: Record<string, number>;
  tables: Record<string, Row[]>;
}

export interface BackupResult {
  name: string;
  bytes: number;
  counts: Record<string, number>;
  kept: number;
  removed: string[];
}

const PAGE = 1000;

/**
 * One name per backup, to the second: `daily/2026-11-25T04-17-03Z.json.gz`.
 * A name is never reused — storage sits behind a cache, and a file overwritten
 * in place can be served stale for a while, which would make the read-back
 * check compare against yesterday's bytes.
 */
export const backupName = (d: Date, prefix = 'daily') => `${prefix}/${d.toISOString().slice(0, 19).replace(/:/g, '-')}Z.json.gz`;

/** The UTC day a backup file belongs to (from its name). */
export const backupDay = (name: string) => name.slice(name.lastIndexOf('/') + 1, name.lastIndexOf('/') + 11);

export function pack(file: BackupFile): Buffer {
  return gzipSync(Buffer.from(JSON.stringify(file), 'utf8'));
}

export function unpack(bytes: Uint8Array): BackupFile {
  const file = JSON.parse(gunzipSync(bytes).toString('utf8')) as BackupFile;
  if (file?.version !== 1 || typeof file.tables !== 'object' || typeof file.counts !== 'object') throw new Error('not a backup file');
  return file;
}

/** Which files to delete so that the newest `keepDays` days remain, whatever the number of files per day. */
export function pickRemovals(names: string[], keepDays: number): string[] {
  const days = [...new Set(names.map(backupDay))].sort().reverse();
  const keep = new Set(days.slice(0, Math.max(0, keepDays)));
  return names.filter((n) => !keep.has(backupDay(n)));
}

/** The newest backup of a given UTC day (YYYY-MM-DD), or null. */
export function newestOfDay(names: string[], day: string): string | null {
  return names.filter((n) => backupDay(n) === day).sort().reverse()[0] ?? null;
}

async function dumpTable(sb: SupabaseClient, table: string): Promise<Row[]> {
  const rows: Row[] = [];
  for (let from = 0; ; from += PAGE) {
    // Ordered by primary key: a stable walk even while rows are being added.
    const { data, error } = await sb.from(table).select('*').order('id', { ascending: true }).range(from, from + PAGE - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...((data ?? []) as Row[]));
    if (!data || data.length < PAGE) return rows;
  }
}

async function ensureBucket(sb: SupabaseClient): Promise<void> {
  const { data } = await sb.storage.getBucket(BACKUP_BUCKET);
  if (data) {
    if (data.public) throw new Error(`bucket "${BACKUP_BUCKET}" is public — refusing to write a backup there`);
    return;
  }
  const { error } = await sb.storage.createBucket(BACKUP_BUCKET, { public: false });
  if (error && !/already exists/i.test(error.message)) throw new Error(`bucket: ${error.message}`);
}

export async function listBackups(sb: SupabaseClient, prefix = 'daily'): Promise<{ name: string; bytes: number | null }[]> {
  const { data, error } = await sb.storage.from(BACKUP_BUCKET).list(prefix, { limit: 1000, sortBy: { column: 'name', order: 'desc' } });
  if (error) throw new Error(`list: ${error.message}`);
  return (data ?? [])
    .filter((f) => f.name.endsWith('.json.gz'))
    .map((f) => ({ name: `${prefix}/${f.name}`, bytes: (f.metadata as { size?: number } | null)?.size ?? null }));
}

export async function readBackup(sb: SupabaseClient, name: string): Promise<BackupFile> {
  const { data, error } = await sb.storage.from(BACKUP_BUCKET).download(name);
  if (error || !data) throw new Error(`download ${name}: ${error?.message || 'empty'}`);
  return unpack(new Uint8Array(await data.arrayBuffer()));
}

/**
 * Take a backup. It only counts once it has been read back from storage and
 * is the file just written, with the same number of rows per table as what
 * was read from the database.
 */
export async function takeBackup(sb: SupabaseClient, now: Date, opts: { prefix?: string; tables?: readonly string[] } = {}): Promise<BackupResult> {
  const prefix = opts.prefix ?? 'daily';
  const tables = opts.tables ?? BACKUP_TABLES;
  await ensureBucket(sb);

  const file: BackupFile = { version: 1, takenAt: now.toISOString(), counts: {}, tables: {} };
  for (const t of tables) {
    file.tables[t] = await dumpTable(sb, t);
    file.counts[t] = file.tables[t].length;
  }

  const name = backupName(now, prefix);
  const bytes = pack(file);
  const { error: upErr } = await sb.storage.from(BACKUP_BUCKET).upload(name, bytes, { contentType: 'application/gzip', upsert: false });
  if (upErr) throw new Error(`upload: ${upErr.message}`);

  try {
    const back = await readBackup(sb, name);
    if (back.takenAt !== file.takenAt) throw new Error(`read back a file taken at ${back.takenAt}`);
    for (const t of tables) {
      if ((back.tables[t]?.length ?? -1) !== file.counts[t]) throw new Error(`${t}: wrote ${file.counts[t]}, read back ${back.tables[t]?.length ?? 'nothing'}`);
    }
  } catch (err) {
    // A file that did not verify must not sit there looking like a backup.
    await sb.storage.from(BACKUP_BUCKET).remove([name]).catch(() => {});
    throw new Error(`verification failed (${(err as Error).message}); the file was removed`);
  }

  const all = (await listBackups(sb, prefix)).map((b) => b.name);
  const removed = pickRemovals(all, BACKUP_KEEP);
  if (removed.length) {
    const { error: rmErr } = await sb.storage.from(BACKUP_BUCKET).remove(removed);
    if (rmErr) throw new Error(`rotation: ${rmErr.message}`);
  }
  return { name, bytes: bytes.length, counts: file.counts, kept: all.length - removed.length, removed };
}

/**
 * Leads that are in a backup and no longer in the database.
 * `restorable`: their form still exists, so they can be put back as they were.
 * `orphaned`: their form is gone too; a lead cannot exist without one.
 */
export function missingLeads(
  backup: BackupFile,
  live: { leadIds: Set<string>; formIds: Set<string> },
  filter: { formId?: string; developerId?: string } = {}
): { restorable: Row[]; orphaned: number; present: number } {
  const formsOfDeveloper = filter.developerId
    ? new Set((backup.tables.forms ?? []).filter((f) => f.client_id === filter.developerId).map((f) => String(f.id)))
    : null;
  const out = { restorable: [] as Row[], orphaned: 0, present: 0 };
  for (const lead of backup.tables.submissions ?? []) {
    const formId = String(lead.form_id);
    if (filter.formId && formId !== filter.formId) continue;
    if (formsOfDeveloper && !formsOfDeveloper.has(formId)) continue;
    if (live.leadIds.has(String(lead.id))) out.present++;
    else if (!live.formIds.has(formId)) out.orphaned++;
    else out.restorable.push(lead);
  }
  return out;
}
