import { redirect } from 'next/navigation';
import { getPortalSession } from '@/lib/portalAuth';
import { supabase } from '@/lib/supabase';
import { getPlan } from '@/lib/plans';
import SignOutLink from '@/components/client/SignOutLink';

/**
 * End-client portal shell. White-labeled to the developer's brand
 * (name, logo, accent color). The Formdock byline only appears when the
 * developer's plan does NOT include white-label.
 */
export default async function PortalProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getPortalSession();
  if (!session) redirect('/portal/login');

  const [{ data: pu }, { data: parent }] = await Promise.all([
    supabase.from('portal_users').select('name').eq('id', session.portalUserId).maybeSingle(),
    supabase.from('clients').select('name, logo_url, primary_color, plan').eq('id', session.parentClientId).maybeSingle(),
  ]);

  const brandName = parent?.name || 'Client portal';
  const accent = parent?.primary_color || '#0F172A';
  const whiteLabel = getPlan(parent?.plan).whiteLabel;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            {parent?.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={parent.logo_url} alt={brandName} className="h-8 w-8 rounded-lg object-contain" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white" style={{ background: accent }}>
                {brandName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="leading-tight">
              <p className="text-sm font-bold text-slate-900">{brandName}</p>
              {pu?.name && <p className="text-xs text-slate-400">{pu.name}</p>}
            </div>
          </div>
          <SignOutLink redirectTo="/portal/login" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>

      {!whiteLabel && (
        <footer className="mx-auto max-w-6xl px-6 pb-8 text-center text-xs text-slate-400">
          Powered by Formdock
        </footer>
      )}
    </div>
  );
}
