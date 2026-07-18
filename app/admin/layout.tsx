'use client';

import { Sidebar } from '@/components/admin/Sidebar';
import { Toaster } from '@/components/ui/Toaster';
import { useAntiScraping } from '@/lib/useAntiScraping';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforce anti-inspection scripts in production for the entire admin section
  useAntiScraping();

  return (
    // Dark-first admin (matches the brand); toggle in the sidebar persists
    // the choice, and the inline script applies it before first paint.
    <div id="admin-root" className="dark flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(localStorage.getItem('inlet-admin-theme')==='light')document.getElementById('admin-root').classList.remove('dark')}catch(e){}`,
        }}
      />
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-8 py-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
      <Toaster />
    </div>
  );
}
