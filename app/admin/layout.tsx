import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import { getLocale } from '@/lib/i18n';
import { getNonce } from '@/lib/nonce';
import { getAppDict } from '@/lib/appDict';
import { verifyJWT, isAdminAccess } from '@/lib/jwt';

export const metadata = { robots: { index: false, follow: false } };

/**
 * The operator area checks the session here too, not only in proxy.ts.
 * The proxy is the first door; a flaw in the framework's request pipeline
 * (one was published in November 2026) must not be enough to render this
 * shell to a stranger. Without a valid operator access token the answer is
 * the same not-found page as any missing route.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const secret = process.env.JWT_SECRET;
  const token = (await cookies()).get('access_token')?.value;
  if (!secret || !token || !isAdminAccess(await verifyJWT(token, secret))) notFound();

  const [locale, nonce] = await Promise.all([getLocale(), getNonce()]);
  return <AdminShell t={getAppDict(locale).admin} nonce={nonce}>{children}</AdminShell>;
}
