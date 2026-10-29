import ClientsPanel from '@/components/developer/ClientsPanel';
import { getLocale } from '@/lib/i18n';
import { getAppDict } from '@/lib/appDict';

export const metadata = { title: 'Clients' };

export default async function ClientsPage() {
  const t = getAppDict(await getLocale()).endClients;
  return <ClientsPanel t={t} />;
}
