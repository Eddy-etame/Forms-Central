import DeveloperPanel from '@/components/developer/DeveloperPanel';
import { getLocale } from '@/lib/i18n';
import { getAppDict } from '@/lib/appDict';

export const metadata = { title: 'Developer — API & MCP' };

export default async function DeveloperPage() {
  const t = getAppDict(await getLocale()).developer;
  return <DeveloperPanel t={t} />;
}
