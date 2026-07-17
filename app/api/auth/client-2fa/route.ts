import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { signJWT } from '@/lib/jwt';
import { verifyOtpChallenge } from '@/lib/otp';
import { checkRateLimit, clientIp } from '@/lib/rateLimit';
import { logSecurityEvent, SEC } from '@/lib/securityEvents';

/**
 * Second step of 2FA client login: verify the emailed 6-digit code and, on
 * success, issue the session. The challenge was created only after a correct
 * password, is single-use, expires in 10 min, and locks after 5 attempts.
 */
export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  try {
    const { challengeId, code } = await req.json();
    if (!challengeId || !code) {
      return NextResponse.json({ success: false, error: 'Code required.' }, { status: 400 });
    }

    // Throttle code guessing across challenges (per IP) on top of the per-
    // challenge 5-attempt cap.
    const ok = await checkRateLimit(`2fa:${ip}`, 15, 60_000);
    if (!ok) {
      logSecurityEvent({ type: SEC.RATE_LIMIT_BLOCK, severity: 'warn', ip, detail: 'client-2fa throttled' });
      return NextResponse.json({ success: false, error: 'Too many attempts. Try again in a minute.' }, { status: 429 });
    }

    const result = await verifyOtpChallenge(String(challengeId), String(code).trim());
    if (!result.ok || result.subjectType !== 'client') {
      logSecurityEvent({ type: SEC.CLIENT_LOGIN_FAILED, severity: 'warn', ip, detail: `2FA ${result.ok ? 'wrong-subject' : result.reason}` });
      const msg =
        !result.ok && result.reason === 'expired' ? 'Code expired — sign in again.' :
        !result.ok && result.reason === 'locked' ? 'Too many wrong codes — sign in again.' :
        'Incorrect code.';
      return NextResponse.json({ success: false, error: msg }, { status: 401 });
    }

    const clientId = result.subjectId;

    // Confirm the account still exists before issuing a session.
    const { data: client, error } = await supabase.from('clients').select('id, email').eq('id', clientId).single();
    if (error || !client) {
      return NextResponse.json({ success: false, error: 'Account not found.' }, { status: 401 });
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      return NextResponse.json({ success: false, error: 'Server configuration error.' }, { status: 500 });
    }

    const token = await signJWT(
      { sub: 'client', clientId, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 },
      JWT_SECRET
    );

    logSecurityEvent({ type: SEC.CLIENT_LOGIN_OK, severity: 'info', actor: client.email, ip, meta: { clientId, via: '2fa' } });

    const cookieStore = await cookies();
    cookieStore.set('client_access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('client-2fa error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
}
