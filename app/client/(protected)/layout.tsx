import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/lib/jwt';
import { getClientForms } from '@/lib/actions';
import ClientSidebar from '@/components/client/ClientSidebar';
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

  const forms = await getClientForms();

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-slate-50">
      {/* Mobile Header (Hidden on large screens where Sidebar handles logo) */}
      <header className="lg:hidden sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
        <div className="flex items-center gap-2">
          <LogoBadge className="h-8 w-8 rounded-lg" />
          <span className="font-bold text-slate-900">Inlet</span>
        </div>
        <SignOutLink className="text-sm font-medium text-red-600 hover:text-red-700" />
      </header>

      {/* Sidebar */}
      <div className="hidden lg:block shrink-0">
        <ClientSidebar forms={forms} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-6 w-full max-w-[1400px] mx-auto overflow-x-hidden min-h-screen">
        {children}
      </main>
    </div>
  );
}
