import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getDeveloperSession, DEVELOPER_COOKIE } from '@/lib/developerAuth';
import { getClientForms } from '@/lib/actions';
import { getLocale } from '@/lib/i18n';
import { getNonce } from '@/lib/nonce';
import { getAppDict } from '@/lib/appDict';
import ClientSidebar from '@/components/developer/ClientSidebar';
import MobileSidebar from '@/components/developer/MobileSidebar';
import CommandPalette from '@/components/developer/CommandPalette';
import { LogoBadge } from '@/components/Logo';
import SignOutLink from '@/components/developer/SignOutLink';
import { Toaster } from '@/components/ui/Toaster';

export const metadata = { robots: { index: false, follow: false } };

export default async function ClientProtectedLayout({ children }: { children: React.ReactNode }) {
  // One validated path for pages and API alike: signed, not expired, account
  // still there, not ended by a password reset, device session not revoked.
  const session = await getDeveloperSession();
  if (!session) {
    // A cookie that no longer opens anything was signed out, replaced by a newer device, or expired.
    const hadCookie = !!(await cookies()).get(DEVELOPER_COOKIE)?.value;
    redirect(hadCookie ? '/developer/login?evicted=1' : '/developer/login');
  }
  if (session.sid) {
    const { touchClientSession } = await import('@/lib/clientSessions');
    touchClientSession(session.sid);
  }

  const [forms, locale, nonce] = await Promise.all([getClientForms(), getLocale(), getNonce()]);
  const dict = getAppDict(locale);
  const t = dict.sidebar;

  return (
    // Dark-first workspace (devs live in dark). ThemeToggle flips the class;
    // the inline script applies the persisted choice before first paint.
    <div id="dash-root" className="dark flex min-h-screen flex-col lg:flex-row bg-slate-50 dark:bg-slate-950">
      <script
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: `try{if(localStorage.getItem('inlet-theme')==='light')document.getElementById('dash-root').classList.remove('dark')}catch(e){}`,
        }}
      />
      {/* Mobile Header (Hidden on large screens where Sidebar handles logo) */}
      <header className="lg:hidden sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center gap-2">
          <MobileSidebar forms={forms} t={t} />
          <LogoBadge className="h-8 w-8 rounded-lg" />
          <span className="font-bold text-slate-900 dark:text-white">Inlet</span>
        </div>
        <SignOutLink className="text-sm font-medium text-red-600 hover:text-red-700" label={t.signOut} />
      </header>

      {/* Sidebar */}
      <div className="hidden lg:block shrink-0">
        <ClientSidebar forms={forms} t={t} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-6 w-full max-w-[1400px] mx-auto overflow-x-hidden min-h-screen lg:pb-24">
        {children}
      </main>

      {/* ⌘K — keyboard-first navigation across the whole workspace */}
      <CommandPalette forms={forms} t={dict.palette} />

      <Toaster />
    </div>
  );
}
