import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';

/**
 * First-party pageview beacon. Privacy-conscious: the raw IP is never stored —
 * only a salted hash. Only public marketing paths are recorded; authed/admin
 * areas are ignored. Always returns 204 (fire-and-forget).
 */

const IGNORED = ['/admin', '/api', '/client', '/portal', '/login'];

function classifyDevice(ua: string): string {
  const u = ua.toLowerCase();
  if (/bot|crawler|spider|crawling|preview|facebookexternalhit|slurp/.test(u)) return 'bot';
  if (/mobile|android|iphone|ipad|ipod/.test(u)) return 'mobile';
  return 'desktop';
}
function classifyBrowser(ua: string): string {
  if (/edg\//i.test(ua)) return 'Edge';
  if (/chrome|crios/i.test(ua) && !/edg\//i.test(ua)) return 'Chrome';
  if (/firefox|fxios/i.test(ua)) return 'Firefox';
  if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) return 'Safari';
  return 'Other';
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    let path = String(body.path ?? '').slice(0, 512);
    if (!path.startsWith('/')) return new NextResponse(null, { status: 204 });
    // strip query/hash to keep the path set tidy
    path = path.split('?')[0].split('#')[0];
    if (IGNORED.some((p) => path === p || path.startsWith(p + '/'))) {
      return new NextResponse(null, { status: 204 });
    }

    const jar = await cookies();
    let sid = jar.get('ie_sid')?.value;
    const fresh = !sid;
    if (!sid) sid = crypto.randomUUID();

    // per-session flood guard (fail-open)
    if (!(await checkRateLimit(`track:${sid}`, 80, 60_000))) {
      return new NextResponse(null, { status: 204 });
    }

    const h = await headers();
    const ip = (h.get('x-forwarded-for') || '').split(',')[0].trim();
    const salt = process.env.JWT_SECRET || 'track_salt';
    const ipHash = ip ? crypto.createHash('sha256').update(ip + salt).digest('hex').slice(0, 32) : null;
    const ua = (h.get('user-agent') || '').slice(0, 300);
    const country = h.get('x-vercel-ip-country') || null;

    let referrer = String(body.referrer ?? '').slice(0, 512) || null;
    // don't record our own origin as a referrer (internal navigation)
    try {
      const origin = new URL(req.url).origin;
      if (referrer && referrer.startsWith(origin)) referrer = null;
    } catch {}

    await supabase.from('pageviews').insert({
      path,
      referrer,
      session_id: sid,
      ip_hash: ipHash,
      device: classifyDevice(ua),
      browser: classifyBrowser(ua),
      country,
    });

    const res = new NextResponse(null, { status: 204 });
    if (fresh) {
      res.cookies.set('ie_sid', sid, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
      });
    }
    return res;
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
