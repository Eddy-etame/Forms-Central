import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { takeBackup } from '@/lib/backupCore';
import { recordJobRun } from '@/lib/jobRuns';
import { runHousekeeping } from '@/lib/housekeeping';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Daily backup (vercel.json `crons`, `Authorization: Bearer <CRON_SECRET>`):
 * accounts, clients, forms and leads to a private bucket, read back and
 * compared before it counts, 14 days kept. The answer carries row counts,
 * never data. Retention deletes nothing unless a run of this job succeeded in
 * the last 26 hours.
 *
 * The same run then lets go of what the privacy policy says the service does
 * not keep: old visits, old logs, dead sessions, expired bans
 * (lib/housekeeping.ts). It runs whether or not the backup succeeded — none
 * of those tables is part of a backup, and none holds a lead.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const startedAt = new Date();

  let backup: Awaited<ReturnType<typeof takeBackup>> | null = null;
  let backupError = '';
  try {
    backup = await takeBackup(supabase, startedAt);
    console.log('[BACKUP]', backup.name, `${backup.bytes} bytes`, JSON.stringify(backup.counts));
  } catch (err) {
    backupError = (err as Error)?.message || String(err);
    console.error('[BACKUP] failed:', backupError);
  }

  const housekeeping = await runHousekeeping(supabase, startedAt).catch((err) => ({
    removed: {} as Record<string, number>,
    errors: [(err as Error)?.message || String(err)],
  }));
  if (housekeeping.errors.length) console.error('[HOUSEKEEPING]', housekeeping.errors.join(' | '));
  else console.log('[HOUSEKEEPING]', JSON.stringify(housekeeping.removed));

  await recordJobRun('backup', { ok: !!backup, summary: { ...(backup ?? { error: backupError }), housekeeping }, startedAt });
  return backup
    ? NextResponse.json({ success: true, ...backup, housekeeping })
    : NextResponse.json({ success: false, error: backupError, housekeeping }, { status: 500 });
}
