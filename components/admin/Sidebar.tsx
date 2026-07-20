'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Users, ScrollText, ShieldAlert, ShieldCheck, BarChart3, DollarSign, Briefcase, Mail, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LogoBadge } from '@/components/Logo';
import ThemeToggle from '@/components/client/ThemeToggle';
import type { AppDict } from '@/lib/appDict';

export function Sidebar({ t }: { t: AppDict['admin'] }) {
  const pathname = usePathname();

  const navigation = [
    { name: t.nav.dashboard, href: '/admin', icon: LayoutDashboard },
    { name: t.nav.analytics, href: '/admin/analytics', icon: BarChart3 },
    { name: t.nav.revenue, href: '/admin/revenue', icon: DollarSign },
    { name: t.nav.forms, href: '/admin/forms', icon: FileText },
    { name: t.nav.clients, href: '/admin/clients', icon: Users },
    { name: t.nav.emailHealth, href: '/admin/email', icon: Mail },
    { name: t.nav.security, href: '/admin/security', icon: ShieldCheck },
    { name: t.nav.logs, href: '/admin/logs', icon: ScrollText },
    { name: t.nav.blacklist, href: '/admin/blacklist', icon: ShieldAlert },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-slate-100 bg-white px-4 py-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Brand */}
      <div className="flex items-center gap-3 px-2">
        <LogoBadge className="h-9 w-9 rounded-lg" />
        <div>
          <h1 className="text-sm font-bold text-slate-900 leading-none dark:text-white">Inlet</h1>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">{t.nav.adminLabel}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-8 flex-1 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
              )}
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* My Atelier — establishes the owner's own subscriber session (via
          /api/admin/atelier) then lands on the dashboard. Plain <a>, not
          next/link: this hits a route handler that sets a cookie + 302s. */}
      <a
        href="/api/admin/atelier"
        className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors dark:border-slate-700 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
      >
        <Briefcase className="h-4.5 w-4.5" />
        {t.nav.myAtelier}
      </a>

      {/* Theme + Logout */}
      <div className="mt-4 border-t border-slate-100 pt-4 space-y-1 dark:border-slate-800">
        <ThemeToggle className="w-full" rootId="admin-root" storageKey="inlet-admin-theme" lightLabel={t.nav.lightMode} darkLabel={t.nav.darkMode} />
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
        >
          <LogOut className="h-4.5 w-4.5" />
          {t.nav.signOut}
        </button>
      </div>
    </div>
  );
}
