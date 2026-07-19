'use client';

import { useTransition } from 'react';

/**
 * Visible FR / EN switch. Writes the inlet-locale cookie (1 year) so the
 * server resolves the chosen language on every subsequent render, then
 * refreshes. The active locale comes from the server (getLocale) so there's
 * no flash of the wrong language.
 */
export function LanguageToggle({ locale, dark = false }: { locale: 'fr' | 'en'; dark?: boolean }) {
  const [pending, startTransition] = useTransition();

  const choose = (next: 'fr' | 'en') => {
    if (next === locale) return;
    document.cookie = `inlet-locale=${next};path=/;max-age=31536000;samesite=lax`;
    startTransition(() => window.location.reload());
  };

  const base = 'px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide rounded transition-colors';
  const activeCls = dark ? 'bg-white text-slate-950' : 'bg-slate-900 text-white';
  const idleCls = dark
    ? 'text-slate-400 hover:text-white'
    : 'text-slate-500 hover:text-slate-900';

  return (
    <div
      role="group"
      aria-label="Language"
      aria-busy={pending}
      className={`flex items-center gap-0.5 rounded-md border px-0.5 py-0.5 ${
        dark ? 'border-white/15' : 'border-slate-200'
      }`}
    >
      {(['fr', 'en'] as const).map((l) => (
        <button
          key={l}
          onClick={() => choose(l)}
          aria-pressed={locale === l}
          className={`${base} ${locale === l ? activeCls : idleCls}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
