import PortalLeads from '@/components/portal/PortalLeads';
import { getLocale } from '@/lib/i18n';
import { getAppDict } from '@/lib/appDict';

export async function generateMetadata() {
  const t = getAppDict(await getLocale()).portal.home;
  return { title: t.title };
}

export default function PortalHome() {
  return <PortalLeads />;
}
