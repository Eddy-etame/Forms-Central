import { getClientSingleFormStats } from '@/lib/actions';
import { getLocale } from '@/lib/i18n';
import { getAppDict } from '@/lib/appDict';
import FormDashboardClient from '@/components/client/FormDashboardClient';

export default async function FormSpecificDashboardPage({ params }: { params: Promise<{ formId: string }> | { formId: string } }) {
  // Await params if it's a promise (Next.js 14+ specific patterns) or just use it.
  const resolvedParams = await Promise.resolve(params);
  const [stats, locale] = await Promise.all([getClientSingleFormStats(resolvedParams.formId), getLocale()]);

  return <FormDashboardClient stats={stats as any} t={getAppDict(locale).formPage} />;
}
