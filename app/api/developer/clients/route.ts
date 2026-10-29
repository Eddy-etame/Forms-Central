import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getDeveloperContext } from '@/lib/developerAuth';
import { checkRateLimit, clientIp } from '@/lib/rateLimit';
import { getLocale } from '@/lib/i18n';
import { EMAIL_RE, normalizeLang } from '@/lib/domain';
import { createClientForDeveloper } from '@/lib/clients';
import { isServiceError } from '@/lib/forms';

/**
 * Clients (the businesses a developer builds sites for). Table: portal_users.
 *
 *   GET    → the developer's clients with their forms and the plan limit
 *   POST   → create a client; optionally e-mail a set-password invite
 *   PATCH  → edit name / e-mail / website / language / lead notifications
 *   DELETE → remove a client that has no forms left
 *
 * Every form belongs to a client (migration v22), so this is the first thing
 * a developer does after signing up — on every plan.
 */

const CLIENT_SELECT = 'id, name, email, website, lang, notify_leads, encrypted_password, last_login_at, created_at';

function shape(row: Record<string, unknown>) {
  const { encrypted_password, ...rest } = row;
  return { ...rest, has_access: !!encrypted_password };
}

export async function GET() {
  const dev = await getDeveloperContext();
  if (!dev) return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 });

  const [{ data: rows }, { data: forms }] = await Promise.all([
    supabase.from('portal_users').select(CLIENT_SELECT).eq('parent_client_id', dev.developerId).order('created_at', { ascending: false }),
    supabase.from('forms').select('id, name, portal_user_id, is_active').eq('client_id', dev.developerId),
  ]);

  const clients = (rows ?? []).map((r) => ({
    ...shape(r as Record<string, unknown>),
    forms: (forms ?? []).filter((f) => f.portal_user_id === r.id).map((f) => ({ id: f.id, name: f.name, is_active: f.is_active })),
  }));

  return NextResponse.json({
    success: true,
    clientLimit: dev.plan.clientLimit,
    clientPortals: dev.plan.clientPortals,
    clients,
  });
}

export async function POST(req: Request) {
  const dev = await getDeveloperContext();
  if (!dev) return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 });
  if (!(await checkRateLimit(`client-create:${clientIp(req.headers)}`, 15, 60_000))) {
    return NextResponse.json({ success: false, error: 'Slow down a moment.' }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim().toLowerCase();
  const website = String(body.website ?? '').trim().slice(0, 200) || null;
  const lang = normalizeLang(body.lang, 'fr');
  const notifyLeads = body.notifyLeads === undefined ? true : !!body.notifyLeads;
  const invite = body.invite === undefined ? true : !!body.invite;

  const locale = await getLocale();
  const result = await createClientForDeveloper({
    developerId: dev.developerId,
    developerName: dev.name,
    plan: dev.plan,
    name,
    email,
    website,
    lang,
    notifyLeads,
    invite,
    origin: new URL(req.url).origin,
    locale,
  });
  if (isServiceError(result)) {
    return NextResponse.json(
      { success: false, error: result.error, ...(result.paywall ? { paywall: true, upgradeUrl: '/pricing' } : {}) },
      { status: result.status }
    );
  }
  if (result.existing) {
    return NextResponse.json({ success: false, error: 'You already have a client with this e-mail.', code: 'CLIENT_EXISTS', client: result.client }, { status: 409 });
  }
  return NextResponse.json({ success: true, client: { ...result.client, forms: [] }, invited: result.invited });
}

export async function PATCH(req: Request) {
  const dev = await getDeveloperContext();
  if (!dev) return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const id = String(body.id ?? '');
  if (!id) return NextResponse.json({ success: false, error: 'id required.' }, { status: 400 });

  const patch: Record<string, unknown> = {};
  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (name.length < 2 || name.length > 80) return NextResponse.json({ success: false, error: 'Client name must be 2–80 characters.' }, { status: 400 });
    patch.name = name;
  }
  if (body.email !== undefined) {
    const email = String(body.email).trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return NextResponse.json({ success: false, error: 'Invalid e-mail.' }, { status: 400 });
    patch.email = email;
  }
  if (body.website !== undefined) patch.website = String(body.website).trim().slice(0, 200) || null;
  if (body.lang !== undefined) patch.lang = normalizeLang(body.lang, 'fr');
  if (body.notifyLeads !== undefined) patch.notify_leads = !!body.notifyLeads;
  if (Object.keys(patch).length === 0) return NextResponse.json({ success: false, error: 'Nothing to update.' }, { status: 400 });

  const { data, error } = await supabase
    .from('portal_users')
    .update(patch)
    .eq('id', id)
    .eq('parent_client_id', dev.developerId) // scope: never another developer's client
    .select(CLIENT_SELECT)
    .maybeSingle();

  if (error) {
    if ((error as { code?: string }).code === '23505') {
      return NextResponse.json({ success: false, error: 'This e-mail already belongs to a client.' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: 'Could not update the client.' }, { status: 500 });
  }
  if (!data) return NextResponse.json({ success: false, error: 'Client not found.' }, { status: 404 });
  return NextResponse.json({ success: true, client: shape(data as Record<string, unknown>) });
}

export async function DELETE(req: Request) {
  const dev = await getDeveloperContext();
  if (!dev) return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const id = String(body.id ?? '');
  if (!id) return NextResponse.json({ success: false, error: 'id required.' }, { status: 400 });

  const { count } = await supabase
    .from('forms')
    .select('id', { count: 'exact', head: true })
    .eq('portal_user_id', id)
    .eq('client_id', dev.developerId);
  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { success: false, error: 'This client still has forms. Move or delete its forms first.', code: 'CLIENT_HAS_FORMS' },
      { status: 409 }
    );
  }

  const { error } = await supabase
    .from('portal_users')
    .delete()
    .eq('id', id)
    .eq('parent_client_id', dev.developerId);
  if (error) return NextResponse.json({ success: false, error: 'Could not remove the client.' }, { status: 500 });
  return NextResponse.json({ success: true });
}
