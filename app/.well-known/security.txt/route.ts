import { SITE_URL } from '@/lib/seo';

/**
 * /.well-known/security.txt (RFC 9116): where to report a weakness.
 *
 * The contact is the address the legal pages already publish
 * (LEGAL_CONTACT_EMAIL, else OPERATOR_EMAIL); without one, the security
 * section of the privacy policy. The file states its own expiry, as the RFC
 * requires — six months from the day it is read, so it can never go stale
 * while the service is up.
 */
export const dynamic = 'force-dynamic';

export function GET() {
  const contact = (process.env.LEGAL_CONTACT_EMAIL || process.env.OPERATOR_EMAIL || '').trim();
  const expires = new Date(Date.now() + 182 * 86_400_000);
  expires.setUTCHours(0, 0, 0, 0);
  const lines = [
    ...(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) ? [`Contact: mailto:${contact}`] : []),
    `Contact: ${SITE_URL}/legal/privacy`,
    `Expires: ${expires.toISOString().replace('.000Z', 'Z')}`,
    'Preferred-Languages: en, fr',
    `Canonical: ${SITE_URL}/.well-known/security.txt`,
    `Policy: ${SITE_URL}/legal/privacy`,
    '',
  ];
  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' },
  });
}
