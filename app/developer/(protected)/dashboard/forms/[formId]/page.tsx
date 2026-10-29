import { getClientSingleFormStats } from '@/lib/actions';
import { getLocale } from '@/lib/i18n';
import { getAppDict } from '@/lib/appDict';
import FormDashboardClient, { type SingleFormStats } from '@/components/developer/FormDashboardClient';

export default async function FormSpecificDashboardPage({ params }: { params: Promise<{ formId: string }> | { formId: string } }) {
  // Await params if it's a promise (Next.js 14+ specific patterns) or just use it.
  const resolvedParams = await Promise.resolve(params);
  const [stats, locale] = await Promise.all([getClientSingleFormStats(resolvedParams.formId), getLocale()]);

  const dict = getAppDict(locale);
  return <FormDashboardClient stats={stats as unknown as SingleFormStats} t={dict.formPage} formId={resolvedParams.formId} sn={dict.snippets} />;
}
