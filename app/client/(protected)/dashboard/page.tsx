import { getClientDashboardStats, getClientForms } from '@/lib/actions';
import GlobalDashboardClient from '@/components/client/GlobalDashboardClient';

export default async function ClientDashboardPage() {
  const [stats, forms] = await Promise.all([getClientDashboardStats(), getClientForms()]);

  return <GlobalDashboardClient stats={stats as any} forms={forms} />;
}
