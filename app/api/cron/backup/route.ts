import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { takeBackup } from '@/lib/backupCore';
import { recordJobRun } from '@/lib/jobRuns';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Daily backup (vercel.json `crons`, `Authorization: Bearer <CRON_SECRET>`):
 * accounts, clients, forms and leads to a private bucket, read back and
 * compared before it counts, 14 days kept. The answer carries row counts,
 * never data. Retention deletes nothing unless a run of this job succeeded in
 * the last 26 hours.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const startedAt = new Date();
  try {
    const result = await takeBackup(supabase, startedAt);
    await recordJobRun('backup', { ok: true, summary: { ...result }, startedAt });
    console.log('[BACKUP]', result.name, `${result.bytes} bytes`, JSON.stringify(result.counts));
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    const message = (err as Error)?.message || String(err);
    console.error('[BACKUP] failed:', message);
    await recordJobRun('backup', { ok: false, summary: { error: message }, startedAt });
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
