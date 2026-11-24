import { getClientDashboardStats, getClientForms } from '@/lib/actions';
import { getLocale } from '@/lib/i18n';
import { getAppDict } from '@/lib/appDict';
import { getDeveloperSession } from '@/lib/developerAuth';
import { upcomingDeletions } from '@/lib/retention';
import GlobalDashboardClient, { type DashboardStats } from '@/components/developer/GlobalDashboardClient';

export default async function ClientDashboardPage() {
  const session = await getDeveloperSession();
  const [stats, forms, locale, upcoming] = await Promise.all([
    getClientDashboardStats(),
    getClientForms(),
    getLocale(),
    session ? upcomingDeletions(session.developerId) : null,
  ]);

  const dict = getAppDict(locale);
  return <GlobalDashboardClient stats={stats as unknown as DashboardStats} forms={forms} t={dict.dashboard} sn={dict.snippets} upcoming={upcoming} locale={locale} />;
}
