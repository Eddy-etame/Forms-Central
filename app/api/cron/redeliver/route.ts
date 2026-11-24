import { NextResponse } from 'next/server';
import { redeliverPending } from '@/lib/delivery';
import { recordJobRun } from '@/lib/jobRuns';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Daily safety net (vercel.json `crons`): send every notification that never
 * left, platform-wide. Requires `Authorization: Bearer <CRON_SECRET>`; without
 * the secret configured the route answers 401 and does nothing.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const startedAt = new Date();
  try {
    const result = await redeliverPending({ limit: 20 });
    console.log('[REDELIVER]', JSON.stringify(result));
    await recordJobRun('redeliver', { ok: result.failed === 0, summary: { ...result }, startedAt });
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    const message = (err as Error)?.message || String(err);
    console.error('[REDELIVER] run failed:', message);
    await recordJobRun('redeliver', { ok: false, summary: { error: message }, startedAt });
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
