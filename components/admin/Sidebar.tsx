'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Users, ScrollText, ShieldAlert, BarChart3, Briefcase, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LogoBadge } from '@/components/Logo';

export function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Forms', href: '/admin/forms', icon: FileText },
    { name: 'Clients', href: '/admin/clients', icon: Users },
    { name: 'Logs & failures', href: '/admin/logs', icon: ScrollText },
    { name: 'Blacklist', href: '/admin/blacklist', icon: ShieldAlert },
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
    <div className="flex h-full w-64 flex-col border-r border-slate-100 bg-white px-4 py-6">
      {/* Brand */}
      <div className="flex items-center gap-3 px-2">
        <LogoBadge className="h-9 w-9 rounded-lg" />
        <div>
          <h1 className="text-sm font-bold text-slate-900 leading-none">Inlet</h1>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Admin</span>
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
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* My Atelier — the owner's own subscriber workspace */}
      <Link
        href="/client/dashboard"
        className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
      >
        <Briefcase className="h-4.5 w-4.5" />
        My Atelier
      </Link>

      {/* Logout */}
      <div className="mt-4 border-t border-slate-100 pt-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <LogOut className="h-4.5 w-4.5" />
          Sign out
        </button>
      </div>
    </div>
  );
}
