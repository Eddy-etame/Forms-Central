import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getPortalSession } from '@/lib/portalAuth';

export const dynamic = 'force-dynamic';

/**
 * Read-only leads for the signed-in end-client.
 * ISOLATION: returns submissions ONLY for forms whose portal_user_id equals
 * this session's portalUserId — never unassigned forms, never other
 * end-clients' forms, never another developer's data.
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
    return NextResponse.json({ success: true, forms: [], leads: [] });
  }

  const { data: leads } = await supabase
    .from('submissions')
    .select('id, form_id, payload, created_at')
    .in('form_id', formIds)
    .order('created_at', { ascending: false })
    .limit(500);

  return NextResponse.json({ success: true, forms, leads: leads ?? [] });
}
