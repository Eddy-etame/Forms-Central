import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { checkRateLimit, clientIp } from '@/lib/rateLimit';
import { logSecurityEvent, SEC } from '@/lib/securityEvents';
import { issueAdminSession } from '@/lib/adminSession';

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request: NextRequest) {
  if (!ADMIN_PASSWORD_HASH || !JWT_SECRET) {
    console.error('Missing authorization setup in environment variables (ADMIN_PASSWORD_HASH or JWT_SECRET).');
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 });
  }

  const ip = clientIp(request.headers);

  try {
    // Brute-force guard: the admin password is a single SHA-256 hash (no scrypt
    // cost), so this endpoint MUST be throttled. 8 attempts/min per IP.
    const okIp = await checkRateLimit(`admin-login:${ip}`, 8, 60_000);
    if (!okIp) {
      logSecurityEvent({ type: SEC.RATE_LIMIT_BLOCK, severity: 'warn', ip, detail: 'admin-login throttled (8/min)' });
      return NextResponse.json({ error: 'Too many attempts. Try again in a minute.' }, { status: 429 });
    }

    const { password } = await request.json();
    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    // Compute SHA-256 hex hash of password
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    if (passwordHash !== ADMIN_PASSWORD_HASH) {
      logSecurityEvent({ type: SEC.ADMIN_LOGIN_FAILED, severity: 'critical', ip, detail: 'Invalid admin password' });
      // Intentionally return 401 Unauthorized for security audit obfuscation
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Password correct. If ADMIN_2FA_EMAIL is set, require the emailed code
    // before issuing any session — the super-admin is the crown jewels.
    const twoFaEmail = process.env.ADMIN_2FA_EMAIL;
    if (twoFaEmail) {
      try {
        const { createOtpChallenge } = await import('@/lib/otp');
        const { sendOtpEmail } = await import('@/lib/email');
        const { challengeId, code } = await createOtpChallenge('admin', 'admin');
        await sendOtpEmail(twoFaEmail, code);
        return NextResponse.json({ success: true, require2fa: true, challengeId });
      } catch (otpErr) {
        console.error('Admin 2FA challenge error:', otpErr);
        return NextResponse.json({ error: 'Could not start two-factor verification. Try again.' }, { status: 500 });
      }
    }

    logSecurityEvent({ type: SEC.ADMIN_LOGIN_OK, severity: 'info', actor: 'admin', ip });
    return await issueAdminSession();
  } catch (error) {
    console.error('Login auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
