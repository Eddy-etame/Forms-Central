import { getClientDashboardStats, getClientForms } from '@/lib/actions';
import { getLocale } from '@/lib/i18n';
import { getAppDict } from '@/lib/appDict';
import GlobalDashboardClient, { type DashboardStats } from '@/components/developer/GlobalDashboardClient';

export default async function ClientDashboardPage() {
  const [stats, forms, locale] = await Promise.all([
    getClientDashboardStats(),
    getClientForms(),
    getLocale(),
  ]);

  const dict = getAppDict(locale);
  return <GlobalDashboardClient stats={stats as unknown as DashboardStats} forms={forms} t={dict.dashboard} sn={dict.snippets} />;
}
