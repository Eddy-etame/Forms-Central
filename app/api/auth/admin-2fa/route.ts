import { NextResponse } from 'next/server';
import { verifyOtpChallenge } from '@/lib/otp';
import { checkRateLimit, clientIp } from '@/lib/rateLimit';
import { logSecurityEvent, SEC } from '@/lib/securityEvents';
import { issueAdminSession } from '@/lib/adminSession';

/**
 * Second step of super-admin login (active when ADMIN_2FA_EMAIL is set):
 * verify the emailed 6-digit code, then issue the admin session. The
 * challenge only exists after a correct password, is single-use, expires in
 * 10 min, and locks after 5 attempts.
 */
export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  try {
    const { challengeId, code } = await req.json();
    if (!challengeId || !code) {
      return NextResponse.json({ error: 'Code required.' }, { status: 400 });
    }

    const ok = await checkRateLimit(`admin-2fa:${ip}`, 10, 60_000);
    if (!ok) {
      logSecurityEvent({ type: SEC.RATE_LIMIT_BLOCK, severity: 'warn', ip, detail: 'admin-2fa throttled' });
      return NextResponse.json({ error: 'Too many attempts. Try again in a minute.' }, { status: 429 });
    }

    const result = await verifyOtpChallenge(String(challengeId), String(code).trim());
    if (!result.ok || result.subjectType !== 'admin') {
      logSecurityEvent({ type: SEC.ADMIN_LOGIN_FAILED, severity: 'critical', ip, detail: `2FA ${result.ok ? 'wrong-subject' : result.reason}` });
      const msg =
        !result.ok && result.reason === 'expired' ? 'Code expired — sign in again.' :
        !result.ok && result.reason === 'locked' ? 'Too many wrong codes — sign in again.' :
        'Incorrect code.';
      return NextResponse.json({ error: msg }, { status: 401 });
    }

    logSecurityEvent({ type: SEC.ADMIN_LOGIN_OK, severity: 'info', actor: 'admin', ip, meta: { via: '2fa' } });
    return await issueAdminSession();
  } catch (err) {
    console.error('admin-2fa error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
