import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { signJWT } from '@/lib/jwt';
import { verifyPassword, needsRehash, hashPassword } from '@/lib/passwords';
import { checkRateLimit, clientIp } from '@/lib/rateLimit';
import { logSecurityEvent, SEC } from '@/lib/securityEvents';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email et mot de passe requis.' },
        { status: 400 }
      );
    }

    // Brute-force guard: 5 attempts/min per IP+email, 20/min per IP.
    const ip = clientIp(req.headers);
    const [okPair, okIp] = await Promise.all([
      checkRateLimit(`login:${ip}:${String(email).toLowerCase()}`, 5, 60_000),
      checkRateLimit(`login-ip:${ip}`, 20, 60_000),
    ]);
    if (!okPair || !okIp) {
      logSecurityEvent({ type: SEC.RATE_LIMIT_BLOCK, severity: 'warn', actor: String(email).toLowerCase(), ip, detail: 'client-login throttled' });
      return NextResponse.json(
        { success: false, error: 'Too many attempts. Try again in a minute.' },
        { status: 429 }
      );
    }

    // Auth lookup goes through the SECURITY DEFINER function (migration_v19) —
    // the password hash can only leave the DB via this one audited path, never
    // a raw table read. Falls back to a maybeSingle() query until v19 is
    // applied (maybeSingle avoids the duplicate-row throw that historically
    // surfaced as a false "Unknown account").
    type ClientAuth = { id: string; encrypted_password: string; two_factor_enabled: boolean; email: string; name: string };
    const normEmail = String(email).trim().toLowerCase();
    let client: ClientAuth | null = null;
    const authRpc = await supabase.rpc('auth_client_by_email', { p_email: normEmail });
    const rpcRows = authRpc.data as unknown as ClientAuth[] | null;
    if (!authRpc.error && Array.isArray(rpcRows)) {
      client = rpcRows[0] ?? null;
    } else {
      const fb = await supabase
        .from('clients')
        .select('id, encrypted_password, two_factor_enabled, email, name')
        .eq('email', normEmail)
        .maybeSingle();
      client = (fb.data as unknown as ClientAuth) ?? null;
    }

    if (!client || !client.encrypted_password) {
      logSecurityEvent({ type: SEC.CLIENT_LOGIN_FAILED, severity: 'warn', actor: String(email).toLowerCase(), ip, detail: 'Unknown account' });
      return NextResponse.json(
        { success: false, error: 'Identifiants incorrects.' },
        { status: 401 }
      );
    }

    // Verify (scrypt hash, with legacy AES fallback).
    if (!verifyPassword(password, client.encrypted_password)) {
      logSecurityEvent({ type: SEC.CLIENT_LOGIN_FAILED, severity: 'warn', actor: String(email).toLowerCase(), ip, detail: 'Wrong password' });
      return NextResponse.json(
        { success: false, error: 'Identifiants incorrects.' },
        { status: 401 }
      );
    }

    // Transparent upgrade: re-store legacy reversible rows as one-way hashes.
    if (needsRehash(client.encrypted_password)) {
      await supabase
        .from('clients')
        .update({ encrypted_password: hashPassword(password) })
        .eq('id', client.id);
    }

    // Password correct. If 2FA is on, DON'T issue a session yet — email a code
    // and hand the browser a challenge id to complete on the second step.
    if (client.two_factor_enabled) {
      try {
        const { createOtpChallenge } = await import('@/lib/otp');
        const { sendOtpEmail } = await import('@/lib/email');
        const { challengeId, code } = await createOtpChallenge('client', client.id);
        await sendOtpEmail(client.email, code);
        return NextResponse.json({ success: true, require2fa: true, challengeId });
      } catch (otpErr) {
        console.error('2FA challenge error:', otpErr);
        return NextResponse.json(
          { success: false, error: 'Could not start two-factor verification. Try again.' },
          { status: 500 }
        );
      }
    }

    // Passwords match -> Generate JWT
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error('Missing JWT_SECRET in env variables');
      return NextResponse.json(
        { success: false, error: 'Erreur de configuration serveur.' },
        { status: 500 }
      );
    }

    // Device registry: cap concurrent devices, evict the oldest (anti-sharing).
    const { registerClientSession } = await import('@/lib/clientSessions');
    const sid = await registerClientSession(client.id, ip, req.headers.get('user-agent'));

    const payload = {
      sub: 'client',
      clientId: client.id,
      ...(sid ? { sid } : {}),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days expiration
    };

    const token = await signJWT(payload, JWT_SECRET);

    logSecurityEvent({ type: SEC.CLIENT_LOGIN_OK, severity: 'info', actor: String(email).toLowerCase(), ip, meta: { clientId: client.id } });

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('client_access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Client login error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur.' },
      { status: 500 }
    );
  }
}
