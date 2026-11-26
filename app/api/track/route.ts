import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';

/**
 * First-party page counter for the public pages. It keeps no cookie and no
 * address.
 *
 * A visit is counted under a value computed from the day, the address, the
 * browser and a secret: the same browser on the same day gives the same value
 * (so a visitor is counted once a day), the next day gives another, and
 * nothing links the two. The raw address is never stored. (Until 2026-11-26
 * this was a random id in a one-year cookie, and the address hash never
 * changed: a visitor could be followed across days without having been asked.)
 *
 * A browser that sends a Global Privacy Control or Do Not Track signal is not
 * counted at all. Only public marketing paths are recorded; authed and
 * operator areas are ignored. Always answers 204.
 */

const IGNORED = ['/admin', '/api', '/developer', '/portal', '/login'];

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

/** Browsers that still carry the old one-year visit cookie drop it on their next visit. */
function forget(res: NextResponse, jar: Awaited<ReturnType<typeof cookies>>): NextResponse {
  if (jar.get('ie_sid')) res.cookies.set('ie_sid', '', { path: '/', maxAge: 0 });
  return res;
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

    const h = await headers();
    // The visitor said no: nothing is recorded.
    if (h.get('sec-gpc') === '1' || h.get('dnt') === '1') return forget(new NextResponse(null, { status: 204 }), await cookies());

    const ip = (h.get('x-forwarded-for') || '').split(',')[0].trim();
    const ua = (h.get('user-agent') || '').slice(0, 300);
    const salt = process.env.JWT_SECRET || 'track_salt';
    const day = new Date().toISOString().slice(0, 10);
    const digest = (v: string) => crypto.createHash('sha256').update(v).digest('hex').slice(0, 32);
    const sid = digest(`visit|${day}|${ip}|${ua}|${salt}`);
    const ipHash = ip ? digest(`addr|${day}|${ip}|${salt}`) : null;

    // Flood guards (fail-open), per visitor of the day and per address of the day.
    const [okSession, okAddress] = await Promise.all([
      checkRateLimit(`track:${sid}`, 80, 60_000),
      checkRateLimit(`track-ip:${ipHash ?? 'unknown'}`, 120, 60_000),
    ]);
    if (!okSession || !okAddress) {
      return new NextResponse(null, { status: 204 });
    }
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

    return forget(new NextResponse(null, { status: 204 }), await cookies());
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
