import AdminShell from '@/components/admin/AdminShell';
import { getLocale } from '@/lib/i18n';
import { getAppDict } from '@/lib/appDict';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = getAppDict(await getLocale()).admin;
  return <AdminShell t={t}>{children}</AdminShell>;
}
