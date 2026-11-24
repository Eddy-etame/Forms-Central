import { NextResponse } from 'next/server';
import { getDeveloperContext } from '@/lib/developerAuth';
import { checkRateLimit, clientIp } from '@/lib/rateLimit';
import { redeliverPending } from '@/lib/delivery';

export const maxDuration = 60; // waits for the mail server: the answer says what really happened

/**
 * Send the notifications that never left, for the signed-in developer's leads.
 * Body: { ids?: string[] } — omit to send every pending one (oldest first, 10 per call).
 */
export async function POST(req: Request) {
  const dev = await getDeveloperContext();
  if (!dev) return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 });
  if (!(await checkRateLimit(`redeliver:${clientIp(req.headers)}`, 6, 60_000))) {
    return NextResponse.json({ success: false, error: 'Slow down a moment.' }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const ids = Array.isArray(body.ids) ? (body.ids as unknown[]).filter((v): v is string => typeof v === 'string' && /^[0-9a-f-]{36}$/i.test(v)) : undefined;

  // Scoped to this developer inside the query itself: an id from another account matches nothing.
  const result = await redeliverPending({ developerId: dev.developerId, submissionIds: ids, limit: 10, minAgeMs: 60_000 });
  return NextResponse.json({ success: true, ...result });
}
