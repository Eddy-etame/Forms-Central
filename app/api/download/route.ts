import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { verifyJWT } from '@/lib/jwt';
import { getDeveloperSession } from '@/lib/developerAuth';
import { getPortalSession } from '@/lib/portalAuth';
import { attachmentPath, downloadAttachment } from '@/lib/storage';

/**
 * Attachment download — the only way to read a lead's file.
 *
 * The caller names a lead and a field, never a URL:
 *   GET /api/download?sid=<submission id>&field=<payload key>
 *
 * We (1) require a session, (2) check that the session may read that lead —
 * the developer who owns the form, the client the form is assigned to, or
 * the operator — and (3) read the object from the private bucket with the
 * service role. Nothing else can be pulled through this route.
 */

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
  const path = attachmentPath(value);
  if (!path) return new NextResponse(typeof value === 'string' ? 'Not a file' : 'Not found', { status: typeof value === 'string' ? 400 : 404 });

  try {
    const blob = await downloadAttachment(path);
    if (!blob) return new NextResponse('File not found', { status: 404 });
    const filename = (path.split('/').pop() || 'file').replace(/[^\w.\-]+/g, '_');
    return new NextResponse(blob.stream(), {
      headers: {
        'Content-Type': blob.type || 'application/octet-stream',
        'Content-Length': String(blob.size),
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
