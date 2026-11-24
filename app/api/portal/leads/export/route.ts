import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getPortalSession } from '@/lib/portalAuth';
import { checkRateLimit, clientIp } from '@/lib/rateLimit';
import { normalizeLang } from '@/lib/domain';
import { exportLeadsCsv, exportFileName, csvResponse, EXPORT_MAX_ROWS } from '@/lib/exportLeads';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Every request of the signed-in client as one CSV file.
 * ISOLATION: only forms whose portal_user_id is this session's client.
 */
export async function GET(req: Request) {
  const session = await getPortalSession();
  if (!session) return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 });
  if (!(await checkRateLimit(`portal-export:${clientIp(req.headers)}`, 6, 60_000))) {
    return NextResponse.json({ success: false, error: 'Slow down a moment.' }, { status: 429 });
  }

  const [{ data: forms, error }, { data: me }] = await Promise.all([
    supabase.from('forms').select('id, name').eq('portal_user_id', session.portalUserId), // the isolation boundary
    supabase.from('portal_users').select('lang').eq('id', session.portalUserId).maybeSingle(),
  ]);
  if (error) return NextResponse.json({ success: false, error: 'Could not read your requests.' }, { status: 500 });

  const result = await exportLeadsCsv({
    forms: ((forms ?? []) as { id: string; name: string }[]).map((f) => ({ id: f.id, name: f.name })),
    lang: normalizeLang((me as { lang?: string | null } | null)?.lang, 'fr'),
    withClient: false,
  });
  if (!result.ok) {
    return result.reason === 'too_many'
      ? NextResponse.json({ success: false, code: 'EXPORT_TOO_LARGE', error: `More than ${EXPORT_MAX_ROWS} requests in one file.` }, { status: 413 })
      : NextResponse.json({ success: false, error: 'Could not read your requests.' }, { status: 500 });
  }
  return csvResponse(result.csv, exportFileName(null), result.rows);
}
