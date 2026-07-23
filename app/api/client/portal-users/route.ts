import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { verifyJWT } from '@/lib/jwt';
import { getPlan, type Plan } from '@/lib/plans';
import { hashPassword } from '@/lib/passwords';
import { generateRandomPassword } from '@/lib/crypto';
import { checkRateLimit, clientIp } from '@/lib/rateLimit';
import { sendPortalUserWelcomeEmail } from '@/lib/email';
import { getLocale } from '@/lib/i18n';

/** End-client (portal user) management for signed-in developers. Paid plans only. */

async function authed(): Promise<{ clientId: string; plan: Plan } | null> {
  const jar = await cookies();
  const token = jar.get('client_access_token')?.value;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return null;
  const payload = await verifyJWT(token, secret);
  if (!payload || payload.sub !== 'client' || !payload.clientId) return null;
  const { data } = await supabase.from('clients').select('plan').eq('id', payload.clientId as string).maybeSingle();
  return { clientId: payload.clientId as string, plan: getPlan(data?.plan) };
}

export async function GET() {
  const auth = await authed();
  if (!auth) return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 });

  const { data: users } = await supabase
    .from('portal_users')
    .select('id, name, email, created_at')
    .eq('parent_client_id', auth.clientId)
    .order('created_at', { ascending: false });

  // Attach assigned-form counts.
  const { data: forms } = await supabase
    .from('forms')
    .select('id, name, portal_user_id')
    .eq('client_id', auth.clientId);

  const withCounts = (users ?? []).map((u) => ({
    ...u,
    forms: (forms ?? []).filter((f) => f.portal_user_id === u.id).map((f) => ({ id: f.id, name: f.name })),
  }));

  return NextResponse.json({
    success: true,
    clientPortals: auth.plan.clientPortals,
    endClientLimit: auth.plan.endClientLimit,
    unassignedForms: (forms ?? []).filter((f) => !f.portal_user_id).map((f) => ({ id: f.id, name: f.name })),
    portalUsers: withCounts,
  });
}

export async function POST(req: Request) {
  const auth = await authed();
  if (!auth) return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 });

  if (!auth.plan.clientPortals) {
    return NextResponse.json(
      { success: false, error: `Client portals start on the Solo plan. You are on ${auth.plan.name}.`, paywall: true, upgradeUrl: '/pricing' },
      { status: 402 }
    );
  }
  if (!(await checkRateLimit(`portaluser:${clientIp(req.headers)}`, 10, 60_000))) {
    return NextResponse.json({ success: false, error: 'Slow down a moment.' }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim().toLowerCase();
  if (name.length < 2) return NextResponse.json({ success: false, error: 'Name is required.' }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ success: false, error: 'Invalid email.' }, { status: 400 });

  // Tiered limit.
  if (auth.plan.endClientLimit !== null) {
    const { count } = await supabase
      .from('portal_users')
      .select('id', { count: 'exact', head: true })
      .eq('parent_client_id', auth.clientId);
    if ((count ?? 0) >= auth.plan.endClientLimit) {
      return NextResponse.json(
        { success: false, error: `Your plan includes ${auth.plan.endClientLimit} end-clients. Upgrade for more.`, paywall: true, upgradeUrl: '/pricing' },
        { status: 402 }
      );
    }
  }

  const rawPassword = generateRandomPassword(12);
  const { data: created, error } = await supabase
    .from('portal_users')
    .insert({ parent_client_id: auth.clientId, name, email, encrypted_password: hashPassword(rawPassword) })
    .select('id, name, email, created_at')
    .single();

  if (error) {
    // Unique violation -> email already used (globally).
    if ((error as { code?: string }).code === '23505') {
      return NextResponse.json({ success: false, error: 'That email is already registered as a portal user.' }, { status: 409 });
    }
    console.error('portal user create error:', error);
    return NextResponse.json({ success: false, error: 'Could not create the end-client.' }, { status: 500 });
  }

  // The password is never returned to the developer — it goes straight to
  // the end-client's own inbox, white-labeled to the developer's brand.
  const [{ data: dev }, locale] = await Promise.all([
    supabase.from('clients').select('name, logo_url, primary_color, font_family').eq('id', auth.clientId).maybeSingle(),
    getLocale(),
  ]);
  sendPortalUserWelcomeEmail(
    email,
    name,
    dev?.name || 'Client portal',
    rawPassword,
    undefined,
    { logo_url: dev?.logo_url, primary_color: dev?.primary_color, font_family: dev?.font_family },
    locale
  ).catch((err) => console.error('portal user welcome email error:', err));

  return NextResponse.json({ success: true, portalUser: created });
}

export async function PATCH(req: Request) {
  const auth = await authed();
  if (!auth) return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 });
  if (!(await checkRateLimit(`portaluser-reset:${clientIp(req.headers)}`, 10, 60_000))) {
    return NextResponse.json({ success: false, error: 'Slow down a moment.' }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const id = String(body.id ?? '');
  if (!id) return NextResponse.json({ success: false, error: 'id required.' }, { status: 400 });

  // Scope: only reset an end-client that belongs to this developer.
  const { data: user } = await supabase
    .from('portal_users')
    .select('id, name, email')
    .eq('id', id)
    .eq('parent_client_id', auth.clientId)
    .maybeSingle();
  if (!user) return NextResponse.json({ success: false, error: 'End-client not found.' }, { status: 404 });

  const rawPassword = generateRandomPassword(12);
  const { error } = await supabase.from('portal_users').update({ encrypted_password: hashPassword(rawPassword) }).eq('id', id);
  if (error) return NextResponse.json({ success: false, error: 'Could not reset the password.' }, { status: 500 });

  const [{ data: dev }, locale] = await Promise.all([
    supabase.from('clients').select('name, logo_url, primary_color, font_family').eq('id', auth.clientId).maybeSingle(),
    getLocale(),
  ]);
  sendPortalUserWelcomeEmail(
    user.email,
    user.name,
    dev?.name || 'Client portal',
    rawPassword,
    'true',
    { logo_url: dev?.logo_url, primary_color: dev?.primary_color, font_family: dev?.font_family },
    locale
  ).catch((err) => console.error('portal user reset email error:', err));

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const auth = await authed();
  if (!auth) return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const id = String(body.id ?? '');
  if (!id) return NextResponse.json({ success: false, error: 'id required.' }, { status: 400 });

  const { error } = await supabase
    .from('portal_users')
    .delete()
    .eq('id', id)
    .eq('parent_client_id', auth.clientId); // scope: never delete another developer's end-client
  if (error) return NextResponse.json({ success: false, error: 'Could not remove the end-client.' }, { status: 500 });
  return NextResponse.json({ success: true });
}
