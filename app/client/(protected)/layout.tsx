import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/lib/jwt';
import { getClientForms } from '@/lib/actions';
import { getLocale } from '@/lib/i18n';
import { getAppDict } from '@/lib/appDict';
import ClientSidebar from '@/components/client/ClientSidebar';
import CommandPalette from '@/components/client/CommandPalette';
import { LogoBadge } from '@/components/Logo';
import SignOutLink from '@/components/client/SignOutLink';

export default async function ClientProtectedLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('client_access_token')?.value;
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!token || !JWT_SECRET) {
    redirect('/client/login');
  }

  const payload = await verifyJWT(token, JWT_SECRET);
  if (!payload || payload.sub !== 'client' || !payload.clientId) {
    redirect('/client/login');
  }

  // Device limit: a session evicted by a newer device stops working here.
  if (payload.sid) {
    const { isSessionRevoked } = await import('@/lib/clientSessions');
    if (await isSessionRevoked(payload.sid as string)) {
      redirect('/client/login?evicted=1');
    }
  }

  const [forms, locale] = await Promise.all([getClientForms(), getLocale()]);
  const dict = getAppDict(locale);
  const t = dict.sidebar;

  return (
    // Dark-first workspace (devs live in dark). ThemeToggle flips the class;
    // the inline script applies the persisted choice before first paint.
    <div id="dash-root" className="dark flex min-h-screen flex-col lg:flex-row bg-slate-50 dark:bg-slate-950">
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(localStorage.getItem('inlet-theme')==='light')document.getElementById('dash-root').classList.remove('dark')}catch(e){}`,
        }}
      />
      {/* Mobile Header (Hidden on large screens where Sidebar handles logo) */}
      <header className="lg:hidden sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center gap-2">
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
      <main className="flex-1 p-6 w-full max-w-[1400px] mx-auto overflow-x-hidden min-h-screen">
        {children}
      </main>

      {/* ⌘K — keyboard-first navigation across the whole workspace */}
      <CommandPalette forms={forms} t={dict.palette} />
    </div>
  );
}
