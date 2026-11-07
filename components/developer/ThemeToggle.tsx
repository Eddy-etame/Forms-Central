'use client';

import { useSyncExternalStore } from 'react';
import { Sun, Moon } from 'lucide-react';

/**
 * Workspace theme toggle. Each dark-first surface ships its root with .dark
 * (client dashboard: #dash-root, admin: #admin-root); this flips the class
 * and persists the choice under its own storage key. An inline script in
 * each layout applies the stored choice before paint.
 */
export default function ThemeToggle({
  className = '',
  rootId = 'dash-root',
  storageKey = 'inlet-theme',
  lightLabel = 'Light mode',
  darkLabel = 'Dark mode',
}: {
  className?: string;
  rootId?: string;
  storageKey?: string;
  lightLabel?: string;
  darkLabel?: string;
}) {
  // The root's `.dark` class is the source of truth (an inline script applies the
  // stored choice before paint). Reading it through useSyncExternalStore keeps the
  // first client render in sync with the DOM without a setState inside an effect.
  const isDark = useSyncExternalStore(
    (notify) => {
      const root = document.getElementById(rootId);
      if (!root) return () => {};
      const obs = new MutationObserver(notify);
      obs.observe(root, { attributes: true, attributeFilter: ['class'] });
      return () => obs.disconnect();
    },
    () => document.getElementById(rootId)?.classList.contains('dark') ?? true,
    () => true,
  );

  const toggle = () => {
    const root = document.getElementById(rootId);
    if (!root) return;
    const next = !root.classList.contains('dark');
    root.classList.toggle('dark', next);
    try { localStorage.setItem(storageKey, next ? 'dark' : 'light'); } catch {}
  };

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white ${className}`}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {isDark ? lightLabel : darkLabel}
    </button>
  );
}
