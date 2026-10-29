import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getDeveloperContext } from '@/lib/developerAuth';
import { checkRateLimit, clientIp } from '@/lib/rateLimit';
import { sendClientInviteEmail } from '@/lib/email';
import { issueClientInvite } from '@/lib/invites';
import { getLocale } from '@/lib/i18n';
import { isSyntheticEmail } from '@/lib/domain';

/**
 * (Re)send a client's portal access link. Works both as the first invite and
 * as a password reset: the client chooses a new password on the site. The
 * developer never sees or receives a password.
 */
export async function POST(req: Request) {
  const dev = await getDeveloperContext();
  if (!dev) return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 });
  if (!(await checkRateLimit(`client-invite:${clientIp(req.headers)}`, 10, 60_000))) {
    return NextResponse.json({ success: false, error: 'Slow down a moment.' }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const id = String(body.id ?? '');
  if (!id) return NextResponse.json({ success: false, error: 'id required.' }, { status: 400 });

  const { data: client } = await supabase
    .from('portal_users')
    .select('id, name, email, lang, encrypted_password')
    .eq('id', id)
    .eq('parent_client_id', dev.developerId)
    .maybeSingle();
  if (!client) return NextResponse.json({ success: false, error: 'Client not found.' }, { status: 404 });
  if (isSyntheticEmail(client.email)) {
    return NextResponse.json({ success: false, error: 'Set a real e-mail address for this client first.' }, { status: 400 });
  }

  const url = await issueClientInvite(client.id, { origin: new URL(req.url).origin });
  if (!url) return NextResponse.json({ success: false, error: 'Could not create the access link.' }, { status: 500 });

  const [{ data: brand }, locale] = await Promise.all([
    supabase.from('clients').select('name, logo_url, primary_color, font_family').eq('id', dev.developerId).maybeSingle(),
    getLocale(),
  ]);
  const isReset = !!client.encrypted_password;
  const sent = await sendClientInviteEmail(client.email, client.name, brand?.name || dev.name, url, isReset, brand, client.lang || locale).catch(() => false);
  if (!sent) return NextResponse.json({ success: false, error: 'The e-mail could not be sent. Check the sending configuration and try again.' }, { status: 502 });

  return NextResponse.json({ success: true, isReset });
}
