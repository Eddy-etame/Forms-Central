import { getClientDashboardStats } from '@/lib/actions';
import GlobalDashboardClient from '@/components/client/GlobalDashboardClient';

export default async function ClientDashboardPage() {
  const stats = await getClientDashboardStats();
  
  return <GlobalDashboardClient stats={stats as any} />;
}
