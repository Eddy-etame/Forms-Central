import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { issueDeveloperToken, developerCookieOptions, DEVELOPER_COOKIE } from '@/lib/developerAuth';
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

    const token = await issueDeveloperToken(clientId, ip, req.headers.get('user-agent'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Server configuration error.' }, { status: 500 });
    }

    logSecurityEvent({ type: SEC.CLIENT_LOGIN_OK, severity: 'info', actor: client.email, ip, meta: { clientId, via: '2fa' } });

    const cookieStore = await cookies();
    cookieStore.set(DEVELOPER_COOKIE, token, developerCookieOptions());

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('client-2fa error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
}
