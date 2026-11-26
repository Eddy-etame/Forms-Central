/**
 * What the daily housekeeping would remove — and, with --apply, remove it now.
 *
 *   npm run housekeeping              counts only, changes nothing
 *   npm run housekeeping -- --apply   the same run the backup job does every day
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from the
 * environment, then from .env.local. The rules are in lib/housekeeping.ts.
 */
import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { runHousekeeping, previewHousekeeping, KEEP_DAYS } from '../lib/housekeeping.ts';

function env(name: string): string {
  if (process.env[name]) return process.env[name] as string;
  try {
    const line = fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).find((l) => l.startsWith(name + '='));
    return line ? line.slice(name.length + 1).trim().replace(/^["']|["']$/g, '') : '';
  } catch { return ''; }
}

const url = env('NEXT_PUBLIC_SUPABASE_URL');
const key = env('SUPABASE_SERVICE_ROLE_KEY');
if (!url || !key) { console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.'); process.exit(2); }
const sb = createClient(url, key, { auth: { persistSession: false } });
const apply = process.argv.includes('--apply');

const LABELS: Record<string, string> = {
  visits: `visits older than ${KEEP_DAYS.visits} days`,
  securityEvents: `security events older than ${KEEP_DAYS.securityEvents} days`,
  failures: `failure lines older than ${KEEP_DAYS.failures} days`,
  emailLog: `e-mail log lines older than ${KEEP_DAYS.emailLog} days`,
  oneTimeCodes: `sign-in codes older than ${KEEP_DAYS.oneTimeCodes} day`,
  rateLimitRows: `rate-limit counters older than ${KEEP_DAYS.rateLimitRows} day`,
  expiredBans: `bans expired more than ${KEEP_DAYS.expiredBans} days ago`,
  deviceSessions: `device sessions unused for ${KEEP_DAYS.deviceSessions} days`,
  deviceSessionsNeverSeen: `device sessions never used, ${KEEP_DAYS.deviceSessions} days old`,
  assistantAddress: `assistant usage lines whose address is older than ${KEEP_DAYS.assistantAddress} days (address blanked, line kept)`,
};

const result = apply ? await runHousekeeping(sb) : await previewHousekeeping(sb);
console.log(apply ? 'Housekeeping applied:' : 'Housekeeping preview (nothing was changed):');
for (const [name, label] of Object.entries(LABELS)) console.log(`  ${String(result.removed[name] ?? 0).padStart(6)}  ${label}`);
for (const e of result.errors) console.log(`  ! ${e}`);
if (!apply) console.log('\nRun with --apply to do it now; the backup job does it every day at 04:17 UTC.');
process.exit(result.errors.length ? 1 : 0);
