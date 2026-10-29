import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { verifyJWT } from '@/lib/jwt';
import { getDeveloperSession } from '@/lib/developerAuth';
import { getPortalSession } from '@/lib/portalAuth';

/**
 * Attachment download — closes the open proxy (court order A3).
 *
 * The caller names a lead and a field, never a URL:
 *   GET /api/download?sid=<submission id>&field=<payload key>
 *
 * We then (1) require a session, (2) check that the session may read that
 * lead — the developer who owns the form, the client the form is assigned to,
 * or the operator — and (3) only fetch from this project's own storage host.
 * An arbitrary URL can no longer be pulled through the server.
 */

const STORAGE_HOST = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co').host;
  } catch {
    return '';
  }
})();

async function isOperator(): Promise<boolean> {
  const secret = process.env.JWT_SECRET;
  if (!secret) return false;
  const token = (await cookies()).get('access_token')?.value;
  if (!token) return false;
  const payload = await verifyJWT(token, secret);
  return !!payload && payload.sub === 'admin';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sid = searchParams.get('sid') || '';
  const field = searchParams.get('field') || '';
  if (!/^[0-9a-f-]{36}$/i.test(sid) || !field || field.length > 200) {
    return new NextResponse('Bad request', { status: 400 });
  }

  const [dev, portal, admin] = await Promise.all([getDeveloperSession(), getPortalSession(), isOperator()]);
  if (!dev && !portal && !admin) return new NextResponse('Sign in required', { status: 401 });

  const { data: sub } = await supabase
    .from('submissions')
    .select('id, payload, forms(client_id, portal_user_id)')
    .eq('id', sid)
    .maybeSingle();
  if (!sub) return new NextResponse('Not found', { status: 404 });

  const form = sub.forms as unknown as { client_id: string; portal_user_id: string | null } | null;
  const allowed =
    admin ||
    (dev && form?.client_id === dev.developerId) ||
    (portal && form?.portal_user_id === portal.portalUserId);
  if (!allowed) return new NextResponse('Not found', { status: 404 });

  const value = (sub.payload as Record<string, unknown>)?.[field];
  if (typeof value !== 'string') return new NextResponse('Not found', { status: 404 });

  let target: URL;
  try {
    target = new URL(value);
  } catch {
    return new NextResponse('Not a file', { status: 400 });
  }
  if (target.protocol !== 'https:' || target.host !== STORAGE_HOST || !target.pathname.startsWith('/storage/v1/object/')) {
    return new NextResponse('Not a file', { status: 400 });
  }

  try {
    const upstream = await fetch(target.toString());
    if (!upstream.ok) return new NextResponse('File not found', { status: 404 });
    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    const filename = decodeURIComponent(target.pathname.split('/').pop() || 'file').replace(/[^\w.\-]+/g, '_');
    return new NextResponse(upstream.body, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Download proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
