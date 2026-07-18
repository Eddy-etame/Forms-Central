'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, FileText, KeyRound, Users, LogOut, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LogoBadge } from '@/components/Logo';
import ThemeToggle from '@/components/client/ThemeToggle';

export default function ClientSidebar({ forms }: { forms: { id: string, name: string }[] }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex-shrink-0 flex flex-col h-[calc(100vh-4rem)] lg:h-screen sticky top-0 lg:top-0 z-20 dark:border-slate-800 dark:bg-slate-950">
      {/* Mobile/Tablet hidden header inside sidebar for standalone feel on desktop */}
      <div className="hidden lg:flex h-16 w-full items-center border-b border-slate-200 px-6 shrink-0 dark:border-slate-800">
        <LogoBadge className="h-8 w-8 rounded-lg" />
        <span className="font-bold text-slate-900 ml-3 dark:text-white">Inlet</span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-6">
        
        {/* Main Nav */}
        <div className="flex flex-col gap-1">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            General
          </p>
          <Link href="/client/dashboard" className="relative px-3 py-2 rounded-lg text-sm font-medium transition-colors group">
            {pathname === '/client/dashboard' && (
              <motion.div 
                layoutId="active-bg" 
                className="absolute inset-0 bg-blue-50 border border-blue-100 rounded-lg dark:bg-blue-500/10 dark:border-blue-500/25"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className={cn(
              "relative flex items-center z-10",
              pathname === '/client/dashboard' ? "text-blue-700 dark:text-blue-400" : "text-slate-600 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white"
            )}>
              <LayoutDashboard className="mr-3 h-4 w-4" />
              Overview
            </span>
          </Link>
          <Link href="/client/dashboard/developer" className="relative px-3 py-2 rounded-lg text-sm font-medium transition-colors group">
            {pathname === '/client/dashboard/developer' && (
              <motion.div
                layoutId="active-bg"
                className="absolute inset-0 bg-blue-50 border border-blue-100 rounded-lg"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className={cn(
              "relative flex items-center z-10",
              pathname === '/client/dashboard/developer' ? "text-blue-700 dark:text-blue-400" : "text-slate-600 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white"
            )}>
              <KeyRound className="mr-3 h-4 w-4" />
              Developer
            </span>
          </Link>
          <Link href="/client/dashboard/clients" className="relative px-3 py-2 rounded-lg text-sm font-medium transition-colors group">
            {pathname === '/client/dashboard/clients' && (
              <motion.div
                layoutId="active-bg"
                className="absolute inset-0 bg-blue-50 border border-blue-100 rounded-lg"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className={cn(
              "relative flex items-center z-10",
              pathname === '/client/dashboard/clients' ? "text-blue-700 dark:text-blue-400" : "text-slate-600 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white"
            )}>
              <Users className="mr-3 h-4 w-4" />
              End-clients
            </span>
          </Link>
        </div>

        {/* Forms Nav */}
        <div className="flex flex-col gap-1">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Your forms
          </p>
          {forms.length === 0 ? (
            <p className="px-3 py-2 text-xs text-slate-500 italic">No forms connected yet.</p>
          ) : (
            forms.map((form) => {
              const isActive = pathname === `/client/dashboard/forms/${form.id}`;
              return (
                <Link 
                  key={form.id} 
                  href={`/client/dashboard/forms/${form.id}`} 
                  className="relative px-3 py-2 rounded-lg text-sm font-medium transition-colors group"
                >
                  {isActive && (
                    <motion.div 
                      layoutId="active-bg" 
                      className="absolute inset-0 bg-blue-50 border border-blue-100 rounded-lg dark:bg-blue-500/10 dark:border-blue-500/25"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className={cn(
                    "relative flex items-center justify-between z-10 w-full",
                    isActive ? "text-blue-700 dark:text-blue-400" : "text-slate-600 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white"
                  )}>
                    <span className="flex items-center truncate pr-2">
                      <FileText className="mr-3 h-4 w-4 shrink-0" />
                      <span className="truncate">{form.name}</span>
                    </span>
                    {isActive && <ChevronRight className="h-4 w-4 opacity-50 shrink-0" />}
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-auto p-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
        <ThemeToggle className="w-full" />
        <button
          onClick={async () => {
            // Actually destroy the session server-side before leaving.
            try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
            window.location.href = '/client/login';
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors dark:hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
