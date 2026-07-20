import { getClientDashboardStats, getClientForms } from '@/lib/actions';
import { getLocale } from '@/lib/i18n';
import { getAppDict } from '@/lib/appDict';
import GlobalDashboardClient from '@/components/client/GlobalDashboardClient';

export default async function ClientDashboardPage() {
  const [stats, forms, locale] = await Promise.all([
    getClientDashboardStats(),
    getClientForms(),
    getLocale(),
  ]);

  return <GlobalDashboardClient stats={stats as any} forms={forms} t={getAppDict(locale).dashboard} />;
}
