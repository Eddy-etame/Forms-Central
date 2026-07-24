import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, X, ArrowRight } from "lucide-react";
import { NavBar, SiteFooter } from "@/components/marketing/NavBar";
import AiChat from "@/components/AiChat";
import { getDictionary } from "@/lib/dictionaries";
import { resolveLocale, SITE_URL, SITE_NAME } from "@/lib/seo";

/**
 * Data-driven competitor comparison pages ("X alternative" search intent).
 * Add a competitor slug/name here and its translated copy to
 * comparePage.competitors in lib/dictionaries.ts — it ships at /compare/<slug>.
 * Claims are factual and fair — no disparagement.
 */

const COMPETITORS = [
  { slug: "formspree", name: "Formspree" },
  { slug: "jotform", name: "Jotform" },
] as const;

export function generateStaticParams() {
  return COMPETITORS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ lang?: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { lang } = await searchParams;
  const c = COMPETITORS.find((x) => x.slug === slug);
  if (!c) return {};
  const locale = await resolveLocale(lang);
  const title = locale === 'fr' ? `Alternative à ${c.name} — Inlet vs ${c.name}` : `${c.name} alternative — Inlet vs ${c.name}`;
  const description = locale === 'fr'
    ? `Vous cherchez une alternative à ${c.name} ? Inlet est un backend de formulaires auto-hébergé et en marque blanche : sans SMTP dans vos sites, anti-spam par preuve de travail, un seul tableau de bord pour tous vos sites.`
    : `Looking for a ${c.name} alternative? Inlet is a self-hosted, white-label form backend: no SMTP in your sites, proof-of-work anti-spam, one dashboard for every website you run.`;
  const base = `${SITE_URL}/compare/${c.slug}`;
  return {
    title,
    description,
    alternates: {
      canonical: `${base}${locale === 'en' ? '?lang=en' : '?lang=fr'}`,
      languages: { en: `${base}?lang=en`, fr: `${base}?lang=fr`, 'x-default': base },
    },
    openGraph: { type: 'website', siteName: SITE_NAME, title, description, locale: locale === 'fr' ? 'fr_FR' : 'en_US', alternateLocale: locale === 'fr' ? 'en_US' : 'fr_FR' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

function Cell({ v, yesAria, noAria }: { v: boolean | string; yesAria: string; noAria: string }) {
  if (v === true) return <Check className="h-5 w-5 text-emerald-600" aria-label={yesAria} />;
  if (v === false) return <X className="h-5 w-5 text-slate-300" aria-label={noAria} />;
  return <span className="text-sm text-slate-600">{v}</span>;
}

export default async function ComparePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ lang?: string }> }) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const c = COMPETITORS.find((x) => x.slug === slug);
  if (!c) notFound();
  const locale = await resolveLocale(lang);
  const t = getDictionary(locale).comparePage;
  const ct = t.competitors[c.slug];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: `Inlet vs ${c.name}`,
        description: ct.intro,
        author: { "@type": "Organization", name: "Inlet" },
        publisher: { "@type": "Organization", name: "Inlet" },
        mainEntityOfPage: `${SITE_URL}/compare/${c.slug}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Comparisons", item: `${SITE_URL}/compare/${c.slug}` },
          { "@type": "ListItem", position: 3, name: `Inlet vs ${c.name}`, item: `${SITE_URL}/compare/${c.slug}` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-white text-slate-900 font-sans">
        <NavBar locale={locale} />

        <main className="mx-auto max-w-3xl px-6 py-16 lg:py-20">
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-slate-400">
            <a href="/" className="hover:text-slate-600">{t.breadcrumbHome}</a>
            <span aria-hidden>/</span>
            <span className="text-slate-600">{t.breadcrumbCompare}</span>
            <span aria-hidden>/</span>
            <span className="font-medium text-slate-700">Inlet vs {c.name}</span>
          </nav>
          <p className="text-sm font-semibold text-blue-600">{t.kicker}</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Inlet vs {c.name}
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">{ct.intro}</p>
          <p className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-600">
            <strong className="text-slate-900">{t.fairNoteLabel}</strong> {ct.bestFor}
          </p>

          <div className="mt-10 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[540px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">{t.colCapability}</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Inlet</th>
                  <th className="px-6 py-4 font-medium">{c.name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ct.rows.map((r) => (
                  <tr key={r.label}>
                    <td className="px-6 py-4 font-medium text-slate-800">{r.label}</td>
                    <td className="px-6 py-4"><Cell v={r.us} yesAria={t.yesAria} noAria={t.noAria} /></td>
                    <td className="px-6 py-4"><Cell v={r.them} yesAria={t.yesAria} noAria={t.noAria} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="mt-12 text-2xl font-bold tracking-tight">{t.verdictTitle}</h2>
          <p className="mt-3 leading-8 text-slate-600">{ct.verdict}</p>

          <div className="mt-12 flex flex-col items-center gap-3 rounded-3xl bg-slate-950 p-8 text-center text-white sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h2 className="text-xl font-bold">{t.ctaTitle}</h2>
              <p className="mt-1 text-sm text-slate-400">{t.ctaSubtitle}</p>
            </div>
            <Link
              href="/client/signup"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-slate-900 hover:bg-slate-100 transition-colors"
            >
              {t.ctaButton} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </main>

        <AiChat />
        <SiteFooter locale={locale} />
      </div>
    </>
  );
}
