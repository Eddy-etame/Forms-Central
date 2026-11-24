import { NextResponse } from 'next/server';
import { redeliverPending } from '@/lib/delivery';

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
  const result = await redeliverPending({ limit: 20 });
  console.log('[REDELIVER]', JSON.stringify(result));
  return NextResponse.json({ success: true, ...result });
}
