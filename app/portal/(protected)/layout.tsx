import { redirect } from 'next/navigation';
import { getPortalSession } from '@/lib/portalAuth';
import { supabase } from '@/lib/supabase';
import { getPlan } from '@/lib/plans';
import SignOutLink from '@/components/developer/SignOutLink';
import { getLocale } from '@/lib/i18n';
import { getAppDict } from '@/lib/appDict';
import { SITE_URL } from '@/lib/seo';
import { normalizeLang } from '@/lib/domain';
import LocaleProvider from '@/components/LocaleProvider';

export const metadata = { robots: { index: false, follow: false } };

/**
 * End-client portal shell. White-labeled to the developer's brand
 * (name, logo, accent color). The Inlet byline only appears when the
 * developer's plan does NOT include white-label.
 */
export default async function PortalProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getPortalSession();
  if (!session) redirect('/portal/login');

  const [{ data: pu }, { data: parent }, locale] = await Promise.all([
    supabase.from('portal_users').select('name, lang').eq('id', session.portalUserId).maybeSingle(),
    supabase.from('clients').select('name, logo_url, primary_color, plan').eq('id', session.parentClientId).maybeSingle(),
    getLocale(),
  ]);
  // The inbox speaks the client's language (chosen by the developer, the same one
  // their auto-replies use) — not the browser's guess.
  const portalLocale = normalizeLang(pu?.lang, locale);
  const t = getAppDict(portalLocale).portal.layout;

  const brandName = parent?.name || t.defaultBrandName;
  const accent = parent?.primary_color || '#0F172A';
  const whiteLabel = getPlan(parent?.plan).whiteLabel;
  // Text placed on the brand colour: dark ink on a light brand, white on a dark one.
  const hex = /^#?([0-9a-f]{6})$/i.exec(accent)?.[1];
  const luminance = hex ? (0.299 * parseInt(hex.slice(0, 2), 16) + 0.587 * parseInt(hex.slice(2, 4), 16) + 0.114 * parseInt(hex.slice(4, 6), 16)) / 255 : 0;
  const brandVars = { '--brand': hex ? `#${hex}` : '#0F172A', '--brand-ink': luminance > 0.62 ? '#0F172A' : '#FFFFFF' } as React.CSSProperties;

  return (
    <LocaleProvider locale={portalLocale}>
    <div className="min-h-screen bg-slate-50" style={brandVars}>
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
          <SignOutLink redirectTo="/portal/login" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors" label={t.signOut} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>

      {!whiteLabel && (
        <footer className="mx-auto max-w-6xl px-6 pb-8 text-center text-xs text-slate-400">
          <a href={`${SITE_URL}/?ref=portal`} target="_blank" rel="noopener" className="transition-colors hover:text-slate-600">
            {t.poweredBy}
          </a>
        </footer>
      )}
    </div>
    </LocaleProvider>
  );
}
