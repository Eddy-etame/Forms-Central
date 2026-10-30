import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getPlan } from '@/lib/plans';

/**
 * Data retention — makes the pricing table true.
 *
 * Each plan promises a retention window (lib/plans.ts: Free 30 days, Solo a
 * year, Pro/Max unlimited). Vercel calls this route once a day (vercel.json
 * `crons`) with `Authorization: Bearer <CRON_SECRET>`; it deletes the leads
 * older than the developer's window, and the attachments those leads carried.
 *
 * Deliberately conservative: bounded batches, developers with an unlimited
 * window are skipped entirely, and nothing runs without CRON_SECRET.
 */

export const runtime = 'nodejs';
export const maxDuration = 60;

const BATCH = 500;
const SUPABASE_HOST = (() => {
  try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co').host; } catch { return ''; }
})();

/** Storage object paths referenced by a payload (only this project's `uploads` bucket). */
function attachmentPaths(payload: unknown): string[] {
  const out: string[] = [];
  const walk = (v: unknown) => {
    if (typeof v === 'string') {
      try {
        const u = new URL(v);
        const m = u.host === SUPABASE_HOST && u.pathname.match(/^\/storage\/v1\/object\/public\/uploads\/(.+)$/);
        if (m) out.push(decodeURIComponent(m[1]));
      } catch { /* not a URL */ }
    } else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.values(v as Record<string, unknown>).forEach(walk);
  };
  walk(payload);
  return out;
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  // Two explicit switches on top of the secret (2026-10-30 incident: the first
  // scheduled run purged historical leads before the operator had decided):
  // RETENTION_ENABLED=true turns the job on at all, and RETENTION_APPLY=true
  // turns the dry run into real deletes. Anything else only reports.
  if (process.env.RETENTION_ENABLED !== 'true') {
    return NextResponse.json({ success: true, skipped: 'RETENTION_ENABLED is not true' });
  }
  const dryRun = process.env.RETENTION_APPLY !== 'true';

  const { data: developers, error } = await supabase.from('clients').select('id, plan');
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  const summary = { developers: 0, leads: 0, files: 0, errors: [] as string[] };

  for (const dev of developers ?? []) {
    const days = getPlan(dev.plan).retentionDays;
    if (days === null) continue;
    const cutoff = new Date(Date.now() - days * 86_400_000).toISOString();

    const { data: forms } = await supabase.from('forms').select('id').eq('client_id', dev.id);
    const formIds = (forms ?? []).map((f) => f.id);
    if (formIds.length === 0) continue;
    summary.developers++;

    for (let round = 0; round < 20; round++) {
      const { data: old, error: qErr } = await supabase
        .from('submissions')
        .select('id, payload')
        .in('form_id', formIds)
        .lt('created_at', cutoff)
        .limit(BATCH);
      if (qErr) { summary.errors.push(`${dev.id}: ${qErr.message}`); break; }
      if (!old || old.length === 0) break;

      const files = old.flatMap((s) => attachmentPaths(s.payload));
      if (dryRun) {
        summary.leads += old.length;
        summary.files += files.length;
        break; // report the first batch only; nothing is touched
      }
      const { error: dErr } = await supabase.from('submissions').delete().in('id', old.map((s) => s.id));
      if (dErr) { summary.errors.push(`${dev.id}: ${dErr.message}`); break; }
      summary.leads += old.length;

      for (let i = 0; i < files.length; i += 100) {
        const { error: sErr } = await supabase.storage.from('uploads').remove(files.slice(i, i + 100));
        if (sErr) summary.errors.push(`storage: ${sErr.message}`);
        else summary.files += Math.min(100, files.length - i);
      }
      if (old.length < BATCH) break;
    }
  }

  console.log('[RETENTION]', dryRun ? 'dry-run' : 'applied', JSON.stringify(summary));
  return NextResponse.json({ success: true, dryRun, ...summary });
}
