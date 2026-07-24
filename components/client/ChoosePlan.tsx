'use client';

import Link from 'next/link';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import type { Locale } from '@/lib/i18n';
import { getAppDict } from '@/lib/appDict';
import { getDictionary } from '@/lib/dictionaries';
import { PLANS } from '@/lib/plans';
import { upgradeMailto } from '@/lib/upgrade';
import { LogoBadge } from '@/components/Logo';

/**
 * Post-signup plan selection. Paid tiers are the visual focus; the free option
 * stays clearly offered and honestly labeled, just de-emphasized (a plain text
 * link rather than a flashy button). No charge happens here — a paid CTA opens
 * a pre-filled upgrade email (self-serve checkout is not live yet).
 */
export default function ChoosePlan({ locale, accountEmail }: { locale: Locale; accountEmail: string }) {
  const t = getAppDict(locale).choosePlan;
  const pr = getDictionary(locale).pricing;
  const P = PLANS;
  const fmt = (n: number) => n.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US');

  const plans = [
    {
      id: 'solo' as const,
      name: pr.planSolo.name,
      price: P.solo.priceMonthly,
      blurb: pr.planSolo.blurb,
      features: [
        pr.planSolo.f1.replace('{forms}', String(P.solo.formLimit)).replace('{submissions}', fmt(P.solo.submissionsPerMonth)),
        pr.planSolo.f3,
        pr.planSolo.f4,
        pr.planSolo.f5.replace('{n}', '100'),
        pr.planSolo.f6,
      ],
      highlight: false,
    },
    {
      id: 'pro' as const,
      name: pr.planPro.name,
      price: P.pro.priceMonthly,
      blurb: pr.planPro.blurb,
      features: [
        pr.planPro.f1.replace('{submissions}', fmt(P.pro.submissionsPerMonth)),
        pr.planPro.f3,
        pr.planPro.f4,
        pr.planPro.f5,
        pr.planPro.f6,
      ],
      highlight: true,
    },
    {
      id: 'max' as const,
      name: pr.planMax.name,
      price: P.max.priceMonthly,
      blurb: pr.planMax.blurb,
      features: [
        pr.planMax.f1.replace('{submissions}', fmt(P.max.submissionsPerMonth)),
        pr.planMax.f3,
        pr.planMax.f4,
        pr.planMax.f5,
      ],
      highlight: false,
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-slate-900">
      {/* Aurora / grid backdrop, same identity as the marketing pages */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:26px_26px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_50%,transparent_100%)]" />
        <div className="aurora-a absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-blue-500/15 blur-[120px]" />
        <div className="aurora-b absolute -top-10 right-1/3 h-64 w-64 rounded-full bg-violet-400/12 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <Link href="/" className="mx-auto mb-8 inline-flex items-center gap-2.5">
            <LogoBadge className="h-8 w-8 rounded-lg" />
            <span className="font-semibold tracking-tight text-slate-900">Inlet</span>
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <Check className="h-3.5 w-3.5" /> {t.kicker}
          </span>
          <h1 className="mt-5 text-balance text-3xl font-extrabold tracking-tight sm:text-5xl">{t.title}</h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">{t.subtitle}</p>
        </div>

        {/* Paid plans — the visual focus */}
        <div className="mx-auto mt-12 grid max-w-5xl items-stretch gap-6 md:grid-cols-3">
          {plans.map((p) => {
            const isHi = p.highlight;
            const card = (
              <div
                className={`relative flex h-full flex-col rounded-3xl p-7 ${
                  isHi
                    ? 'bg-slate-950 text-white shadow-2xl shadow-blue-500/25'
                    : 'border border-slate-200 bg-white shadow-sm'
                }`}
              >
                {isHi && (
                  <div aria-hidden className="pointer-events-none absolute -top-px left-1/2 h-24 w-56 -translate-x-1/2 rounded-full bg-blue-500/25 blur-[70px]" />
                )}
                <div className="relative flex items-center justify-between">
                  <h2 className={`text-lg font-bold ${isHi ? 'text-white' : 'text-slate-900'}`}>{p.name}</h2>
                  {isHi && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-cyan-400 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-950">
                      <Sparkles className="h-3 w-3" /> {t.recommended}
                    </span>
                  )}
                </div>
                <div className="relative mt-3 flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold tracking-tight">${p.price}</span>
                  <span className={isHi ? 'text-sm text-slate-400' : 'text-sm text-slate-500'}>{pr.perMonth}</span>
                </div>
                <p className={`relative mt-2 text-sm ${isHi ? 'text-slate-300' : 'text-slate-500'}`}>{p.blurb}</p>
                <ul className={`relative mt-5 flex-1 space-y-2.5 text-sm ${isHi ? 'text-slate-200' : 'text-slate-700'}`}>
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check className={`mt-0.5 h-4 w-4 shrink-0 ${isHi ? 'text-cyan-400' : 'text-emerald-600'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={upgradeMailto(PLANS[p.id].name, accountEmail)}
                  className={`btn-shine group relative mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-all duration-300 ${
                    isHi
                      ? 'btn-shine-soft bg-white text-slate-900 hover:bg-slate-100 hover:shadow-lg hover:shadow-white/20'
                      : 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30'
                  }`}
                >
                  {t.ctaChoose.replace('{plan}', p.name)} <ArrowRight className="cta-arrow h-4 w-4" />
                </a>
              </div>
            );
            return isHi ? (
              <div key={p.id} className="rounded-3xl bg-gradient-to-b from-blue-500 to-violet-600 p-px md:-my-2">{card}</div>
            ) : (
              <div key={p.id}>{card}</div>
            );
          })}
        </div>

        {/* Free — clearly offered, honestly labeled, intentionally understated */}
        <div className="mt-10 text-center">
          <Link
            href="/client/dashboard"
            className="link-underline text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
          >
            {t.continueFree} <ArrowRight className="inline h-3.5 w-3.5" />
          </Link>
          <p className="mx-auto mt-1.5 max-w-sm text-xs text-slate-400">{t.freeNote}</p>
        </div>
      </div>
    </main>
  );
}
