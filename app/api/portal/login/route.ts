import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { verifyPassword, needsRehash, hashPassword } from '@/lib/passwords';
import { signPortalToken, PORTAL_COOKIE } from '@/lib/portalAuth';
import { checkRateLimit, clientIp } from '@/lib/rateLimit';

/** End-client login. Issues a portal session cookie (read-only lead access). */
export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}));
  const cleanEmail = String(email ?? '').trim().toLowerCase();
  const cleanPassword = String(password ?? '');
  if (!cleanEmail || !cleanPassword) {
    return NextResponse.json({ success: false, error: 'Email and password required.' }, { status: 400 });
  }

  const ip = clientIp(req.headers);
  const [okPair, okIp] = await Promise.all([
    checkRateLimit(`portal-login:${ip}:${cleanEmail}`, 5, 60_000),
    checkRateLimit(`portal-login-ip:${ip}`, 20, 60_000),
  ]);
  if (!okPair || !okIp) {
    return NextResponse.json({ success: false, error: 'Too many attempts. Try again in a minute.' }, { status: 429 });
  }

  const { data: user } = await supabase
    .from('portal_users')
    .select('id, parent_client_id, encrypted_password')
    .eq('email', cleanEmail)
    .maybeSingle();

  if (!user || !user.encrypted_password || !verifyPassword(cleanPassword, user.encrypted_password)) {
    return NextResponse.json({ success: false, error: 'Incorrect email or password.' }, { status: 401 });
  }

  if (needsRehash(user.encrypted_password)) {
    await supabase.from('portal_users').update({ encrypted_password: hashPassword(cleanPassword) }).eq('id', user.id);
  }

  const token = await signPortalToken({ portalUserId: user.id, parentClientId: user.parent_client_id });
  const jar = await cookies();
  jar.set(PORTAL_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return NextResponse.json({ success: true });
}
