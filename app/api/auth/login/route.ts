import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { checkRateLimit, clientIp } from '@/lib/rateLimit';
import { logSecurityEvent, SEC } from '@/lib/securityEvents';
import { issueAdminSession } from '@/lib/adminSession';
import { getLocale } from '@/lib/i18n';
import { verifyPassword } from '@/lib/passwords';
import { MAX_PASSWORD_LENGTH } from '@/lib/domain';

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request: NextRequest) {
  if (!ADMIN_PASSWORD_HASH || !JWT_SECRET) {
    console.error('Missing authorization setup in environment variables (ADMIN_PASSWORD_HASH or JWT_SECRET).');
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 });
  }

  const ip = clientIp(request.headers);

  try {
    // Brute-force guard: 8 attempts a minute per address, and 40 per ten
    // minutes whatever the address — guessing from many machines at once is
    // slowed to four tries a minute in total.
    const [okIp, okAll] = await Promise.all([
      checkRateLimit(`admin-login:${ip}`, 8, 60_000),
      checkRateLimit('admin-login:all', 40, 10 * 60_000),
    ]);
    if (!okIp || !okAll) {
      logSecurityEvent({ type: SEC.RATE_LIMIT_BLOCK, severity: 'warn', ip, detail: 'admin-login throttled (8/min)' });
      return NextResponse.json({ error: 'Too many attempts. Try again in a minute.' }, { status: 429 });
    }

    const { password } = await request.json();
    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }
    if (password.length > MAX_PASSWORD_LENGTH) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // ADMIN_PASSWORD_HASH is either a salted scrypt hash ("scrypt:…", what
    // scripts/set-admin-password.mjs writes since 2026-11-26) or the older
    // bare SHA-256, compared in constant time. The bare form still works so
    // nobody is locked out; it should be replaced (a leaked SHA-256 can be
    // guessed offline at billions of tries a second).
    let matches: boolean;
    if (ADMIN_PASSWORD_HASH.startsWith('scrypt:')) {
      matches = verifyPassword(password, ADMIN_PASSWORD_HASH);
    } else {
      const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
      const a = Buffer.from(passwordHash, 'utf8');
      const b = Buffer.from(ADMIN_PASSWORD_HASH, 'utf8');
      matches = a.length === b.length && crypto.timingSafeEqual(a, b);
    }

    if (!matches) {
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
        await sendOtpEmail(twoFaEmail, code, await getLocale());
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
