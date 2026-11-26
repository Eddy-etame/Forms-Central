import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getDeveloperContext } from '@/lib/developerAuth';
import { getLocale } from '@/lib/i18n';
import ChoosePlan from '@/components/developer/ChoosePlan';

export const metadata: Metadata = {
  title: 'Choose your plan',
  robots: { index: false, follow: false },
};

/**
 * Post-signup plan selection. Outside the (protected) dashboard shell so it gets
 * a full, focused canvas — but still requires a valid client session.
 */
export default async function ChoosePlanPage() {
  const [dev, locale] = await Promise.all([getDeveloperContext(), getLocale()]);
  if (!dev) redirect('/developer/login');

  return <ChoosePlan locale={locale} accountEmail={dev.email} />;
}
