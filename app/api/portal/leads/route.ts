import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getPortalSession } from '@/lib/portalAuth';
import { checkRateLimit, clientIp } from '@/lib/rateLimit';
import { getPlan } from '@/lib/plans';
import { retentionMode } from '@/lib/retention';

export const dynamic = 'force-dynamic';

/**
 * The signed-in client's requests.
 *
 * ISOLATION: everything here is limited to forms whose portal_user_id equals
 * this session's portalUserId — never unassigned forms, never another
 * client's forms, never another developer's data.
 *
 *   GET   → the client's forms and leads (with the handled state, migration v23)
 *   PATCH → mark one lead as handled, or reopen it: { id, handled }
 */
export async function GET() {
  const session = await getPortalSession();
  if (!session) return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 });

  const { data: forms } = await supabase
    .from('forms')
    .select('id, name')
    .eq('portal_user_id', session.portalUserId); // the isolation boundary

  const formIds = (forms ?? []).map((f) => f.id);
  if (formIds.length === 0) {
    return NextResponse.json({ success: true, forms: [], leads: [], handledSupported: true });
  }

  const read = (columns: string) =>
    supabase.from('submissions').select(columns).in('form_id', formIds).order('created_at', { ascending: false }).limit(500);

  let handledSupported = true;
  let { data: leads, error } = await read('id, form_id, payload, created_at, handled_at');
  if (error) {
    // Deployed before migration v23: the inbox still works, without the handled state.
    handledSupported = false;
    ({ data: leads, error } = await read('id, form_id, payload, created_at'));
  }

  // When retention is deleting, the client is told how long a request stays in this inbox.
  let keptDays: number | null = null;
  if (retentionMode() === 'apply') {
    const { data: owner } = await supabase.from('portal_users').select('clients(plan)').eq('id', session.portalUserId).maybeSingle();
    const dev = (owner as { clients?: { plan?: string | null } | { plan?: string | null }[] | null } | null)?.clients;
    keptDays = getPlan((Array.isArray(dev) ? dev[0]?.plan : dev?.plan) ?? null).retentionDays;
  }

  return NextResponse.json({ success: true, forms, leads: leads ?? [], handledSupported, keptDays });
}

export async function PATCH(req: Request) {
  const session = await getPortalSession();
  if (!session) return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 });
  if (!(await checkRateLimit(`portal-handle:${clientIp(req.headers)}`, 60, 60_000))) {
    return NextResponse.json({ success: false, error: 'Slow down a moment.' }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const id = String(body.id ?? '');
  if (!/^[0-9a-f-]{36}$/i.test(id) || typeof body.handled !== 'boolean') {
    return NextResponse.json({ success: false, error: 'id and handled are required.' }, { status: 400 });
  }

  // The lead must sit on a form assigned to this client — checked inside the query.
  const { data: lead } = await supabase
    .from('submissions')
    .select('id, forms!inner(portal_user_id)')
    .eq('id', id)
    .eq('forms.portal_user_id', session.portalUserId)
    .maybeSingle();
  if (!lead) return NextResponse.json({ success: false, error: 'Not found.' }, { status: 404 });

  const handledAt = body.handled ? new Date().toISOString() : null;
  const { error } = await supabase
    .from('submissions')
    .update({ handled_at: handledAt, handled_by: body.handled ? 'client' : null })
    .eq('id', id);
  if (error) return NextResponse.json({ success: false, error: 'Could not save.' }, { status: 500 });

  return NextResponse.json({ success: true, id, handled_at: handledAt });
}
