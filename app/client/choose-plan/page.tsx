import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { verifyJWT } from '@/lib/jwt';
import { supabase } from '@/lib/supabase';
import { getLocale } from '@/lib/i18n';
import ChoosePlan from '@/components/client/ChoosePlan';

export const metadata: Metadata = {
  title: 'Choose your plan',
  robots: { index: false, follow: false },
};

/**
 * Post-signup plan selection. Outside the (protected) dashboard shell so it gets
 * a full, focused canvas — but still requires a valid client session.
 */
export default async function ChoosePlanPage() {
  const token = (await cookies()).get('client_access_token')?.value;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) redirect('/client/login');

  const payload = await verifyJWT(token, secret!);
  if (!payload || payload.sub !== 'client' || !payload.clientId) redirect('/client/login');

  const [{ data: client }, locale] = await Promise.all([
    supabase.from('clients').select('email').eq('id', payload.clientId as string).maybeSingle(),
    getLocale(),
  ]);

  return <ChoosePlan locale={locale} accountEmail={client?.email ?? ''} />;
}
