import { getClientSingleFormStats } from '@/lib/actions';
import FormDashboardClient from '@/components/client/FormDashboardClient';

export default async function FormSpecificDashboardPage({ params }: { params: Promise<{ formId: string }> | { formId: string } }) {
  // Await params if it's a promise (Next.js 14+ specific patterns) or just use it.
  const resolvedParams = await Promise.resolve(params);
  const stats = await getClientSingleFormStats(resolvedParams.formId);
  
  return <FormDashboardClient stats={stats as any} />;
}
