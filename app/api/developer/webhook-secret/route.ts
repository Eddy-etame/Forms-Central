import { NextResponse } from 'next/server';
import { getDeveloperSession } from '@/lib/developerAuth';
import { getOrCreateSecret, rotateWebhookSecret } from '@/lib/webhooks';
import { checkRateLimit, clientIp } from '@/lib/rateLimit';

/**
 * The webhook signing secret — one per developer account, used by every form.
 * GET returns it (creating it on first use); POST rotates it.
 */
export async function GET() {
  const dev = await getDeveloperSession();
  if (!dev) return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 });
  const secret = await getOrCreateSecret(dev.developerId);
  if (!secret) return NextResponse.json({ success: false, error: 'Could not load the secret.' }, { status: 500 });
  return NextResponse.json({ success: true, secret });
}

export async function POST(req: Request) {
  const dev = await getDeveloperSession();
  if (!dev) return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 });
  if (!(await checkRateLimit(`whsec:${clientIp(req.headers)}`, 5, 60_000))) {
    return NextResponse.json({ success: false, error: 'Slow down a moment.' }, { status: 429 });
  }
  const secret = await rotateWebhookSecret(dev.developerId);
  if (!secret) return NextResponse.json({ success: false, error: 'Could not rotate the secret.' }, { status: 500 });
  return NextResponse.json({ success: true, secret });
}
