'use client';

import Link from 'next/link';
import { LogoBadge } from '@/components/Logo';
import { ShieldCheck, Zap, Lock, Sparkles } from 'lucide-react';
import { useLocale } from '@/lib/useLocale';
import { getAppDict } from '@/lib/appDict';

/**
 * Premium split-screen auth layout: a dark, branded aurora panel beside the
 * form. On mobile the panel collapses to a compact brand header.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  const t = getAppDict(useLocale()).auth.shell;
  const POINTS = [
    { icon: Zap, title: t.point1Title, desc: t.point1Desc },
    { icon: ShieldCheck, title: t.point2Title, desc: t.point2Desc },
    { icon: Lock, title: t.point3Title, desc: t.point3Desc },
  ];
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left — branded panel (desktop) */}
      <aside className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-slate-950 p-12 text-white lg:flex">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="aurora-a absolute -top-24 -left-16 h-96 w-96 rounded-full bg-blue-500/25 blur-[120px]" />
          <div className="aurora-b absolute bottom-0 right-0 h-96 w-96 rounded-full bg-violet-500/20 blur-[120px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_80%_60%_at_30%_20%,#000_40%,transparent_100%)]" />
        </div>

        <Link href="/" className="relative flex items-center gap-2.5">
          <LogoBadge className="h-9 w-9 rounded-xl" />
          <span className="text-lg font-semibold tracking-tight">Inlet</span>
        </Link>

        <div className="relative max-w-md">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" /> {t.badgeText}
          </div>
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-balance">
            {t.headlineA} <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">{t.headlineHighlight}</span>
          </h2>
          <ul className="mt-8 space-y-5">
            {POINTS.map((p) => (
              <li key={p.title} className="flex items-start gap-3.5">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 ring-1 ring-inset ring-white/10">
                  <p.icon className="h-4.5 w-4.5 text-blue-400" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{p.title}</p>
                  <p className="text-sm text-slate-400">{p.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-slate-500">{t.footerTagline}</p>
      </aside>

      {/* Right — form */}
      <div className="relative flex w-full flex-col items-center justify-center px-4 py-12 lg:w-[54%]">
        <div className="absolute top-5 left-5 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <LogoBadge className="h-8 w-8 rounded-lg" />
            <span className="font-semibold text-slate-900">Inlet</span>
          </Link>
        </div>
        <Link href="/" className="absolute top-5 right-6 hidden text-sm font-medium text-slate-400 hover:text-slate-900 transition-colors lg:block">
          {t.backToSite}
        </Link>
        {children}
      </div>
    </div>
  );
}
