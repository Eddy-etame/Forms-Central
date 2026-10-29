import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkRateLimit, clientIp } from '@/lib/rateLimit';
import { issueClientInvite, RESET_TTL_MS } from '@/lib/invites';
import { sendClientInviteEmail } from '@/lib/email';
import { getLocale } from '@/lib/i18n';
import { EMAIL_RE, isSyntheticEmail } from '@/lib/domain';

/**
 * Client "forgot password". Always answers success (no account enumeration).
 * Sends the same single-use set-password link as an invite, valid 1 hour,
 * branded to the developer the client belongs to.
 */
export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  if (!(await checkRateLimit(`portal-forgot:${ip}`, 5, 60_000))) {
    return NextResponse.json({ success: false, error: 'Too many requests. Try again in a minute.' }, { status: 429 });
  }

  const { email } = await req.json().catch(() => ({}));
  const cleanEmail = String(email ?? '').trim().toLowerCase();
  const ok = NextResponse.json({ success: true });
  if (!EMAIL_RE.test(cleanEmail) || isSyntheticEmail(cleanEmail)) return ok;

  const { data: user } = await supabase
    .from('portal_users')
    .select('id, name, lang, parent_client_id')
    .eq('email', cleanEmail)
    .maybeSingle();
  if (!user) return ok;

  const url = await issueClientInvite(user.id, { ttlMs: RESET_TTL_MS, origin: new URL(req.url).origin });
  if (!url) return ok;

  const [{ data: brand }, locale] = await Promise.all([
    supabase.from('clients').select('name, logo_url, primary_color, font_family').eq('id', user.parent_client_id).maybeSingle(),
    getLocale(),
  ]);
  sendClientInviteEmail(cleanEmail, user.name, brand?.name || 'Client portal', url, true, brand, user.lang || locale, 1).catch((e) =>
    console.error('portal reset email error:', e)
  );
  return ok;
}
