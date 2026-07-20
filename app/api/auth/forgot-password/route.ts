import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';
import { sendPasswordResetEmail } from '@/lib/email';
import { checkRateLimit, clientIp } from '@/lib/rateLimit';
import { getLocale } from '@/lib/i18n';

/**
 * Start a password reset. Always responds success (never reveals whether an
 * email is registered — no account enumeration). Stores a SHA-256 hash of a
 * single-use token with a 1-hour expiry and emails the raw token link.
 */
export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  if (!(await checkRateLimit(`forgot:${ip}`, 5, 60_000))) {
    return NextResponse.json({ success: false, error: 'Too many requests. Try again in a minute.' }, { status: 429 });
  }

  const { email } = await req.json().catch(() => ({}));
  const cleanEmail = String(email ?? '').trim().toLowerCase();

  const ok = NextResponse.json({ success: true });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return ok;

  const { data: client } = await supabase.from('clients').select('id').eq('email', cleanEmail).maybeSingle();
  if (!client) return ok; // silent: same response as a real account

  const raw = crypto.randomBytes(32).toString('base64url');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  await supabase.from('clients').update({ reset_token: hash, reset_token_expires: expires }).eq('id', client.id);

  const resetUrl = `${new URL(req.url).origin}/client/reset-password?token=${raw}`;
  sendPasswordResetEmail(cleanEmail, resetUrl, await getLocale()).catch((e) => console.error('reset email error:', e));

  return NextResponse.json({ success: true });
}
