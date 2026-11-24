import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getDeveloperContext } from '@/lib/developerAuth';
import { checkRateLimit, clientIp } from '@/lib/rateLimit';
import { getLocale } from '@/lib/i18n';
import { exportLeadsCsv, exportFileName, csvResponse, EXPORT_MAX_ROWS } from '@/lib/exportLeads';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Every lead of the signed-in developer as one CSV file — on every plan.
 *   GET /api/developer/leads/export            all forms
 *   GET /api/developer/leads/export?form=<id>  one form
 * Scoped by ownership inside the query: a form id from another account matches nothing.
 */
export async function GET(req: Request) {
  const dev = await getDeveloperContext();
  if (!dev) return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 });
  if (!(await checkRateLimit(`export:${clientIp(req.headers)}`, 6, 60_000))) {
    return NextResponse.json({ success: false, error: 'Slow down a moment.' }, { status: 429 });
  }

  const formId = new URL(req.url).searchParams.get('form');
  if (formId && !/^[0-9a-f-]{36}$/i.test(formId)) {
    return NextResponse.json({ success: false, error: 'Unknown form.' }, { status: 404 });
  }

  let query = supabase.from('forms').select('id, name, portal_users(name)').eq('client_id', dev.developerId); // the ownership boundary
  if (formId) query = query.eq('id', formId);
  const { data: forms, error } = await query;
  if (error) return NextResponse.json({ success: false, error: 'Could not read your forms.' }, { status: 500 });
  if (formId && (!forms || forms.length === 0)) {
    return NextResponse.json({ success: false, error: 'Unknown form.' }, { status: 404 });
  }

  const list = ((forms ?? []) as unknown as { id: string; name: string; portal_users: { name: string } | { name: string }[] | null }[]).map((f) => ({
    id: f.id,
    name: f.name,
    clientName: Array.isArray(f.portal_users) ? f.portal_users[0]?.name ?? null : f.portal_users?.name ?? null,
  }));

  const result = await exportLeadsCsv({ forms: list, lang: await getLocale(), withClient: true });
  if (!result.ok) {
    return result.reason === 'too_many'
      ? NextResponse.json({ success: false, code: 'EXPORT_TOO_LARGE', error: `More than ${EXPORT_MAX_ROWS} leads: export one form at a time.` }, { status: 413 })
      : NextResponse.json({ success: false, error: 'Could not read your leads.' }, { status: 500 });
  }
  return csvResponse(result.csv, exportFileName(formId ? list[0]?.name ?? null : null), result.rows);
}
