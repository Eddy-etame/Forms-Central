'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, FileText, Settings, LogOut, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ClientSidebar({ forms }: { forms: { id: string, name: string }[] }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex-shrink-0 flex flex-col h-[calc(100vh-4rem)] lg:h-screen sticky top-0 lg:top-0 z-20">
      {/* Mobile/Tablet hidden header inside sidebar for standalone feel on desktop */}
      <div className="hidden lg:flex h-16 w-full items-center border-b border-slate-200 px-6 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-sm">
          M
        </div>
        <span className="font-bold text-slate-900 ml-3">Espace Client</span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-6">
        
        {/* Main Nav */}
        <div className="flex flex-col gap-1">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Général
          </p>
          <Link href="/client/dashboard" className="relative px-3 py-2 rounded-lg text-sm font-medium transition-colors group">
            {pathname === '/client/dashboard' && (
              <motion.div 
                layoutId="active-bg" 
                className="absolute inset-0 bg-blue-50 border border-blue-100 rounded-lg" 
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className={cn(
              "relative flex items-center z-10",
              pathname === '/client/dashboard' ? "text-blue-700" : "text-slate-600 group-hover:text-slate-900"
            )}>
              <LayoutDashboard className="mr-3 h-4 w-4" />
              Vue d'ensemble
            </span>
          </Link>
        </div>

        {/* Forms Nav */}
        <div className="flex flex-col gap-1">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Vos Formulaires
          </p>
          {forms.length === 0 ? (
            <p className="px-3 py-2 text-xs text-slate-500 italic">Aucun formulaire connecté.</p>
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
                      className="absolute inset-0 bg-blue-50 border border-blue-100 rounded-lg" 
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className={cn(
                    "relative flex items-center justify-between z-10 w-full",
                    isActive ? "text-blue-700" : "text-slate-600 group-hover:text-slate-900"
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

      <div className="mt-auto p-4 border-t border-slate-200">
        <a 
          href="/client/login" 
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </a>
      </div>
    </aside>
  );
}
