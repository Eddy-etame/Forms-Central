import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/passwords';
import { hashToken } from '@/lib/invites';
import { checkRateLimit, clientIp } from '@/lib/rateLimit';
import { signPortalToken, PORTAL_COOKIE } from '@/lib/portalAuth';

/**
 * A client opens the set-password link (invite or reset), chooses a password
 * and is signed in. The token is single-use and hashed at rest.
 */
export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  if (!(await checkRateLimit(`portal-set:${ip}`, 10, 60_000))) {
    return NextResponse.json({ success: false, error: 'Too many attempts. Try again in a minute.' }, { status: 429 });
  }

  const { token, password } = await req.json().catch(() => ({}));
  const raw = String(token ?? '');
  const pwd = String(password ?? '');
  if (!raw) return NextResponse.json({ success: false, error: 'Missing link token.' }, { status: 400 });
  if (pwd.length < 8) return NextResponse.json({ success: false, error: 'Password must be at least 8 characters.' }, { status: 400 });

  const { data: user } = await supabase
    .from('portal_users')
    .select('id, parent_client_id, invite_expires')
    .eq('invite_token_hash', hashToken(raw))
    .maybeSingle();
  if (!user) return NextResponse.json({ success: false, error: 'This link is invalid or was already used.' }, { status: 400 });
  if (!user.invite_expires || new Date(user.invite_expires) < new Date()) {
    return NextResponse.json({ success: false, error: 'This link has expired. Ask for a new one.' }, { status: 400 });
  }

  const { error } = await supabase
    .from('portal_users')
    .update({ encrypted_password: hashPassword(pwd), invite_token_hash: null, invite_expires: null, last_login_at: new Date().toISOString() })
    .eq('id', user.id);
  if (error) return NextResponse.json({ success: false, error: 'Could not save your password. Try again.' }, { status: 500 });

  const session = await signPortalToken({ portalUserId: user.id, parentClientId: user.parent_client_id });
  (await cookies()).set(PORTAL_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return NextResponse.json({ success: true });
}
