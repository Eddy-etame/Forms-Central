import EndClientsPanel from '@/components/client/EndClientsPanel';
import { getLocale } from '@/lib/i18n';
import { getAppDict } from '@/lib/appDict';

export const metadata = { title: 'End-clients — portals' };

export default async function ClientsPage() {
  const t = getAppDict(await getLocale()).endClients;
  return <EndClientsPanel t={t} />;
}
