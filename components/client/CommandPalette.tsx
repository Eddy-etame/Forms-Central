'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, LayoutDashboard, Users, Terminal, FileText, BookOpen,
  CreditCard, LogOut, CornerDownLeft, Command,
} from 'lucide-react';

/**
 * ⌘K command palette for the client dashboard — keyboard-first navigation
 * across forms, pages and actions. The signature interaction of premium dev
 * tools (Linear, Vercel, Raycast); no form-backend competitor has one.
 */

interface PaletteItem {
  id: string;
  label: string;
  hint?: string;
  icon: React.ElementType;
  group: string;
  run: () => void;
}

export default function CommandPalette({ forms }: { forms: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const items = useMemo<PaletteItem[]>(() => {
    const go = (href: string) => () => { setOpen(false); router.push(href); };
    return [
      { id: 'nav-overview', label: 'Overview', hint: 'Dashboard home', icon: LayoutDashboard, group: 'Navigate', run: go('/client/dashboard') },
      { id: 'nav-clients', label: 'Client portals', hint: 'End-client access', icon: Users, group: 'Navigate', run: go('/client/dashboard/clients') },
      { id: 'nav-dev', label: 'Developer & API', hint: 'Keys, MCP, webhooks', icon: Terminal, group: 'Navigate', run: go('/client/dashboard/developer') },
      ...forms.map((f) => ({
        id: `form-${f.id}`,
        label: f.name,
        hint: 'Open form',
        icon: FileText,
        group: 'Forms',
        run: go(`/client/dashboard/forms/${f.id}`),
      })),
      { id: 'res-docs', label: 'Documentation', hint: 'Integration guide', icon: BookOpen, group: 'Resources', run: go('/docs') },
      { id: 'res-pricing', label: 'Pricing & plans', hint: 'Upgrade', icon: CreditCard, group: 'Resources', run: go('/pricing') },
      {
        id: 'act-signout', label: 'Sign out', hint: 'End session', icon: LogOut, group: 'Account',
        run: async () => {
          try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
          window.location.href = '/client/login';
        },
      },
    ];
  }, [forms, router]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.label.toLowerCase().includes(q) || i.group.toLowerCase().includes(q) || (i.hint || '').toLowerCase().includes(q));
  }, [items, query]);

  // Group preserving order
  const groups = useMemo(() => {
    const map = new Map<string, PaletteItem[]>();
    for (const i of filtered) {
      if (!map.has(i.group)) map.set(i.group, []);
      map.get(i.group)!.push(i);
    }
    return [...map.entries()];
  }, [filtered]);

  const openPalette = useCallback(() => {
    setOpen(true);
    setQuery('');
    setActive(0);
    setTimeout(() => inputRef.current?.focus(), 10);
  }, []);

  // Global shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (open) setOpen(false);
        else openPalette();
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, openPalette]);

  // Keep the active row visible
  useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); filtered[active]?.run(); }
  };

  return (
    <>
      {/* Discoverability: floating hint (desktop only, out of the content flow) */}
      <button
        onClick={openPalette}
        className="fixed bottom-5 right-5 z-40 hidden items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3.5 py-2 text-xs font-medium text-slate-500 shadow-lg backdrop-blur transition-all hover:-translate-y-0.5 hover:text-slate-900 hover:shadow-xl lg:flex dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-400 dark:hover:text-white"
        aria-label="Open command palette"
      >
        <Command className="h-3.5 w-3.5" />
        Quick actions
        <kbd className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">⌘K</kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[14vh]" role="dialog" aria-modal="true" aria-label="Command palette">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="fade-up relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            {/* Search */}
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 dark:border-slate-800">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActive(0); }}
                onKeyDown={onInputKey}
                placeholder="Search forms, pages, actions…"
                className="h-13 w-full bg-transparent py-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
              />
              <kbd className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">esc</kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[46vh] overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-slate-400">Nothing matches &ldquo;{query}&rdquo;</p>
              ) : (
                groups.map(([group, groupItems]) => (
                  <div key={group} className="mb-1">
                    <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">{group}</p>
                    {groupItems.map((item) => {
                      const idx = filtered.indexOf(item);
                      const isActive = idx === active;
                      return (
                        <button
                          key={item.id}
                          data-idx={idx}
                          onClick={() => item.run()}
                          onMouseEnter={() => setActive(idx)}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                            isActive ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950' : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5'
                          }`}
                        >
                          <item.icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span className="flex-1 truncate font-medium">{item.label}</span>
                          {item.hint && <span className={`shrink-0 text-xs ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>{item.hint}</span>}
                          {isActive && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-slate-300" />}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-4 border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 text-[11px] text-slate-400 dark:border-slate-800 dark:bg-slate-950/50">
              <span className="flex items-center gap-1"><kbd className="rounded border border-slate-200 bg-white px-1 font-mono">↑↓</kbd> navigate</span>
              <span className="flex items-center gap-1"><kbd className="rounded border border-slate-200 bg-white px-1 font-mono">↵</kbd> open</span>
              <span className="ml-auto font-medium text-slate-300">Inlet</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
