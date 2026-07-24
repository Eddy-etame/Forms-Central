import type { Metadata } from "next";
import Link from "next/link";
import { Check, Minus, ArrowRight } from "lucide-react";
import { Kicker } from "@/components/marketing/Kicker";
import { getDictionary } from "@/lib/dictionaries";
import { resolveLocale, buildMetadata } from "@/lib/seo";
import { NavBar, SiteFooter } from "@/components/marketing/NavBar";
import AiChat from "@/components/AiChat";
import { PLANS } from "@/lib/plans";
import { SpotlightCard, ScrollProgress } from "@/components/marketing/Interactive";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ lang?: string }> }): Promise<Metadata> {
  const { lang } = await searchParams;
  return buildMetadata('pricing', await resolveLocale(lang));
}

const UPGRADE_MAILTO = (plan: string) =>
  `mailto:eddy.eetame@gmail.com?subject=Inlet%20${plan}%20upgrade&body=Hi%2C%20I%27d%20like%20to%20upgrade%20my%20Inlet%20account%20to%20${plan}.%20My%20account%20email%20is%3A%20`;

// Structured data (schema.org) stays in English regardless of page locale — convention for JSON-LD.
const FAQ_JSONLD = [
  {
    q: "What happens if I go over my submission or email quota?",
    a: "Your leads are never lost. Submissions keep being stored in your dashboard even over quota — only outgoing emails pause until the next day or an upgrade. Losing a lead over a billing limit is not acceptable to us.",
  },
  {
    q: "Why is there an emails-per-day limit?",
    a: "Every submission can trigger up to two emails (your notification + the branded auto-reply). Daily caps keep delivery fast and reputable for everyone. Higher tiers get dramatically more throughput.",
  },
  {
    q: "Can I switch plans anytime?",
    a: "Yes — upgrades apply immediately, downgrades at the end of the cycle. Your forms, submissions and settings are never touched by a plan change.",
  },
  {
    q: "Is the free plan really free forever?",
    a: "Yes. Three forms, 50 submissions a month, full anti-spam. It is enough to run a real site — most developers upgrade when they add their second or third client, not because we squeezed them.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_JSONLD.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Inlet",
  description: "Self-hosted form backend for all your websites.",
  brand: { "@type": "Brand", name: "Inlet" },
  offers: Object.values(PLANS).map((p) => ({
    "@type": "Offer",
    name: p.name,
    price: String(p.priceMonthly),
    priceCurrency: "USD",
  })),
};

type Row = { label: string; values: (string | boolean)[] };
const fmt = (n: number) => n.toLocaleString("en-US");
const P = PLANS;

function buildRows(t: ReturnType<typeof getDictionary>["pricing"]): Row[] {
  const valPerMonth = (n: number) => t.valPerMonth.replace("{n}", fmt(n));
  const valDays = (n: number) => t.valDays.replace("{n}", String(n));
  const valEndClients = (n: number | null) => (n === null ? t.valUnlimited : t.valEndClients.replace("{n}", String(n)));
  return [
    { label: t.rowForms, values: [String(P.free.formLimit), String(P.solo.formLimit), t.valUnlimited, t.valUnlimited] },
    {
      label: t.rowSubmissions,
      values: [fmt(P.free.submissionsPerMonth), fmt(P.solo.submissionsPerMonth), fmt(P.pro.submissionsPerMonth), fmt(P.max.submissionsPerMonth)],
    },
    { label: t.rowEmails, values: [fmt(P.free.emailsPerDay), fmt(P.solo.emailsPerDay), fmt(P.pro.emailsPerDay), fmt(P.max.emailsPerDay)] },
    { label: t.rowSpam, values: [true, true, true, true] },
    { label: t.rowAutoReply, values: [true, true, true, true] },
    { label: t.rowSender, values: [P.free.customSender, P.solo.customSender, P.pro.customSender, P.max.customSender] },
    { label: t.row2fa, values: [true, true, true, true] },
    { label: t.rowAi, values: [t.valTrial, valPerMonth(100), t.valUnlimited, t.valUnlimited] },
    { label: t.rowApi, values: [false, true, true, true] },
    {
      label: t.rowPortals,
      values: [
        false,
        valEndClients(P.solo.endClientLimit),
        valEndClients(P.pro.endClientLimit),
        t.valUnlimited,
      ],
    },
    { label: t.rowCsv, values: [false, true, true, true] },
    { label: t.rowAnalytics, values: [false, true, true, true] },
    { label: t.rowWhiteLabel, values: [false, false, true, true] },
    { label: t.rowPriority, values: [false, false, true, true] },
    { label: t.rowRetention, values: [valDays(30), t.valYearRetention, t.valUnlimited, t.valUnlimited] },
    { label: t.rowSupport, values: [false, false, false, true] },
    { label: t.rowDkim, values: [false, false, false, true] },
  ];
}

function Cell({ v, includedAria, notIncludedAria }: { v: string | boolean; includedAria: string; notIncludedAria: string }) {
  if (v === true) return <Check className="h-5 w-5 text-emerald-600" aria-label={includedAria} />;
  if (v === false) return <Minus className="h-5 w-5 text-slate-300" aria-label={notIncludedAria} />;
  return <span className="text-sm text-slate-700">{v}</span>;
}

function PlanCard({
  name,
  price,
  perMonthLabel,
  mostPopularLabel,
  blurb,
  features,
  cta,
  href,
  highlight = false,
  external = false,
}: {
  name: string;
  price: number;
  perMonthLabel: string;
  mostPopularLabel: string;
  blurb: string;
  features: string[];
  cta: string;
  href: string;
  highlight?: boolean;
  external?: boolean;
}) {
  const inner = (
    <>
      {cta} <ArrowRight className="cta-arrow h-4 w-4" />
    </>
  );
  const btnClass = highlight
    ? "btn-shine btn-shine-soft group mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-slate-900 transition-all duration-300 hover:bg-slate-100 hover:shadow-lg hover:shadow-white/10"
    : "btn-shine btn-shine-soft group mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-300 px-5 text-sm font-medium text-slate-800 transition-all duration-300 hover:border-slate-400 hover:shadow-md";
  const content = (
    <>
      <h2 className="relative text-base font-bold">{name}</h2>
      <div className="relative mt-4 flex items-baseline gap-1.5">
        <span className="text-4xl font-extrabold tracking-tight">${price}</span>
        <span className={highlight ? "text-sm text-slate-400" : "text-sm text-slate-500"}>{perMonthLabel}</span>
      </div>
      <p className={`relative mt-2 text-sm ${highlight ? "text-slate-400" : "text-slate-500"}`}>{blurb}</p>
      <ul className={`relative mt-5 flex-1 space-y-2.5 text-sm ${highlight ? "text-slate-200" : "text-slate-700"}`}>
        {features.map((t) => (
          <li key={t} className="flex items-start gap-2.5">
            <Check className={`mt-0.5 h-4 w-4 shrink-0 ${highlight ? "text-emerald-400" : "text-emerald-600"}`} />
            {t}
          </li>
        ))}
      </ul>
      {external ? (
        <a href={href} className={btnClass}>{inner}</a>
      ) : (
        <Link href={href} className={btnClass}>{inner}</Link>
      )}
    </>
  );

  if (highlight) {
    return (
      <div className="relative rounded-3xl bg-gradient-to-b from-blue-500 to-violet-600 p-px shadow-2xl shadow-blue-500/20 transition-transform duration-300 hover:-translate-y-1 xl:-my-2">
        {/* Badge lives on the OUTER wrapper (no overflow-hidden) so it isn't
            clipped by the card's rounded, clipped inner container. */}
        <div className="absolute -top-2.5 left-7 z-10 inline-flex items-center rounded-md bg-cyan-400 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-950 shadow-lg shadow-cyan-500/30">
          {mostPopularLabel}
        </div>
        <SpotlightCard
          glow="rgba(59,130,246,0.18)"
          className="flex h-full flex-col overflow-hidden rounded-[23px] bg-slate-950 p-7 text-white"
        >
          <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-48 w-64 -translate-x-1/2 rounded-full bg-blue-500/25 blur-[90px]" />
          {content}
        </SpotlightCard>
      </div>
    );
  }
  return (
    <SpotlightCard
      glow="rgba(59,130,246,0.07)"
      className="flex flex-col rounded-3xl border border-slate-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
    >
      {content}
    </SpotlightCard>
  );
}

export default async function PricingPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const { lang } = await searchParams;
  const locale = await resolveLocale(lang);
  const dict = getDictionary(locale);
  const t = dict.pricing;
  const swipeHint = dict.landing.compare.swipeHint;
  const rows = buildRows(t);
  const faqItems = [
    { q: t.faqQ1, a: t.faqA1 },
    { q: t.faqQ2, a: t.faqA2 },
    { q: t.faqQ3, a: t.faqA3 },
    { q: t.faqQ4, a: t.faqA4 },
  ];
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([productJsonLd, faqJsonLd]) }}
      />
      <div className="min-h-screen bg-white text-slate-900 font-sans">
        <ScrollProgress />
        <NavBar locale={locale} />

        <header className="relative overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:26px_26px] [mask-image:radial-gradient(ellipse_55%_60%_at_50%_0%,#000_50%,transparent_100%)]" />
            <div className="aurora-a absolute -top-20 left-1/3 h-72 w-72 rounded-full bg-blue-500/15 blur-[110px]" />
            <div className="aurora-b absolute -top-8 right-1/3 h-64 w-64 rounded-full bg-cyan-400/12 blur-[110px]" />
          </div>
          <div className="mx-auto max-w-3xl px-6 pt-16 pb-10 text-center lg:pt-24">
            <Kicker center tone="light" className="mb-5">{t.kicker}</Kicker>
            <h1 className="text-balance text-4xl font-extrabold tracking-tight sm:text-6xl">
              {t.titleLead} <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text font-serif italic text-transparent">{t.titleAccent}</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-600">
              {t.subtitle}
            </p>
          </div>
        </header>

        {/* Plans — Good / Better / Best (+ anchor) */}
        <section className="mx-auto grid max-w-6xl gap-5 px-6 pb-14 md:grid-cols-2 xl:grid-cols-4">
          <PlanCard
            name={t.planFree.name}
            price={0}
            perMonthLabel={t.perMonth}
            mostPopularLabel={t.mostPopular}
            blurb={t.planFree.blurb}
            features={[
              t.planFree.f1.replace("{forms}", String(P.free.formLimit)).replace("{submissions}", String(P.free.submissionsPerMonth)),
              t.planFree.f2.replace("{emails}", String(P.free.emailsPerDay)),
              t.planFree.f3,
              t.planFree.f4,
              t.planFree.f5,
            ]}
            cta={t.planFree.cta}
            href="/client/signup"
          />
          <PlanCard
            name={t.planSolo.name}
            price={P.solo.priceMonthly}
            perMonthLabel={t.perMonth}
            mostPopularLabel={t.mostPopular}
            blurb={t.planSolo.blurb}
            features={[
              t.planSolo.f1.replace("{forms}", String(P.solo.formLimit)).replace("{submissions}", fmt(P.solo.submissionsPerMonth)),
              t.planSolo.f2.replace("{emails}", String(P.solo.emailsPerDay)),
              t.planSolo.f3,
              t.planSolo.f4,
              t.planSolo.f5.replace("{n}", "100"),
              t.planSolo.f6,
            ]}
            cta={t.planSolo.cta}
            href={UPGRADE_MAILTO("Solo")}
            external
          />
          <PlanCard
            name={t.planPro.name}
            price={P.pro.priceMonthly}
            perMonthLabel={t.perMonth}
            mostPopularLabel={t.mostPopular}
            blurb={t.planPro.blurb}
            highlight
            features={[
              t.planPro.f1.replace("{submissions}", fmt(P.pro.submissionsPerMonth)),
              t.planPro.f2.replace("{emails}", String(P.pro.emailsPerDay)),
              t.planPro.f3,
              t.planPro.f4,
              t.planPro.f5,
              t.planPro.f6,
            ]}
            cta={t.planPro.cta}
            href={UPGRADE_MAILTO("Pro")}
            external
          />
          <PlanCard
            name={t.planMax.name}
            price={P.max.priceMonthly}
            perMonthLabel={t.perMonth}
            mostPopularLabel={t.mostPopular}
            blurb={t.planMax.blurb}
            features={[
              t.planMax.f1.replace("{submissions}", fmt(P.max.submissionsPerMonth)),
              t.planMax.f2.replace("{emails}", fmt(P.max.emailsPerDay)),
              t.planMax.f3,
              t.planMax.f4,
              t.planMax.f5,
            ]}
            cta={t.planMax.cta}
            href={UPGRADE_MAILTO("Max")}
            external
          />
        </section>

        <p className="mx-auto -mt-6 max-w-2xl px-6 pb-12 text-center text-xs text-slate-400">
          {t.selfServeNote}
        </p>

        {/* Full comparison */}
        <section className="mx-auto max-w-5xl px-6 pb-16">
          <h2 className="mb-6 text-center text-2xl font-bold tracking-tight">{t.compareTitle}</h2>
          <p className="mb-2 text-center text-xs font-medium text-slate-400 sm:hidden">{swipeHint}</p>
          <div className="relative overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="max-w-[110px] px-4 py-4 font-medium sm:max-w-none sm:px-5">{t.colCapability}</th>
                    <th className="px-5 py-4 font-medium">{t.planFree.name}</th>
                    <th className="px-5 py-4 font-medium">{t.planSolo.name} $9</th>
                    <th className="px-5 py-4 font-semibold text-slate-900">{t.planPro.name} $19</th>
                    <th className="px-5 py-4 font-medium">{t.planMax.name} $49</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((r) => (
                    <tr key={r.label}>
                      <td className="max-w-[110px] px-4 py-3.5 font-medium text-slate-800 sm:max-w-none sm:px-5">{r.label}</td>
                      {r.values.map((v, i) => (
                        <td key={i} className={`px-5 py-3.5 ${i === 2 ? "bg-blue-50/40" : ""}`}>
                          <Cell v={v} includedAria={t.includedAria} notIncludedAria={t.notIncludedAria} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent sm:hidden" />
          </div>
          <p className="mt-6 text-center text-sm text-slate-500">
            {t.compareFooter}
          </p>
        </section>

        {/* Pricing FAQ */}
        <section className="border-t border-slate-100 bg-slate-50/60 py-16">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="mb-8 text-center text-2xl font-bold tracking-tight">{t.faqTitle}</h2>
            <div className="space-y-3">
              {faqItems.map((f) => (
                <details key={f.q} className="group rounded-2xl border border-slate-200 bg-white p-5 open:shadow-sm">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900">
                    {f.q}
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <AiChat />
        <SiteFooter locale={locale} />
      </div>
    </>
  );
}
