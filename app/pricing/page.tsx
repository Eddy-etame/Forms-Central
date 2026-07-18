import type { Metadata } from "next";
import Link from "next/link";
import { Check, Minus, ArrowRight } from "lucide-react";
import { Kicker } from "@/components/marketing/Kicker";
import { NavBar, SiteFooter } from "@/components/marketing/NavBar";
import AiChat from "@/components/AiChat";
import { PLANS } from "@/lib/plans";
import { SpotlightCard, ScrollProgress } from "@/components/marketing/Interactive";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Inlet pricing — Free, Solo ($9), Pro ($19) and Max ($49). Self-hosted form backend with white-label emails, AI assistance, anti-spam and CSV exports. Start free, upgrade when your leads do.",
  alternates: { canonical: "/pricing" },
};

const UPGRADE_MAILTO = (plan: string) =>
  `mailto:eddy.eetame@gmail.com?subject=Inlet%20${plan}%20upgrade&body=Hi%2C%20I%27d%20like%20to%20upgrade%20my%20Inlet%20account%20to%20${plan}.%20My%20account%20email%20is%3A%20`;

const FAQ = [
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
  mainEntity: FAQ.map((f) => ({
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
const ROWS: Row[] = [
  { label: "Forms", values: [String(P.free.formLimit), String(P.solo.formLimit), "Unlimited", "Unlimited"] },
  {
    label: "Submissions / month",
    values: [fmt(P.free.submissionsPerMonth), fmt(P.solo.submissionsPerMonth), fmt(P.pro.submissionsPerMonth), fmt(P.max.submissionsPerMonth)],
  },
  { label: "Emails / day", values: [fmt(P.free.emailsPerDay), fmt(P.solo.emailsPerDay), fmt(P.pro.emailsPerDay), fmt(P.max.emailsPerDay)] },
  { label: "Spam protection (honeypot + PoW + NLP)", values: [true, true, true, true] },
  { label: "Branded auto-reply emails", values: [true, true, true, true] },
  { label: "Custom email sender (name + reply-to)", values: [P.free.customSender, P.solo.customSender, P.pro.customSender, P.max.customSender] },
  { label: "Two-factor sign-in (email OTP)", values: [true, true, true, true] },
  { label: "AI assistant", values: ["1 trial message", "100 / month", "Unlimited", "Unlimited"] },
  { label: "API + MCP server (your AI runs your forms)", values: [false, true, true, true] },
  {
    label: "Client portals (white-label end-client logins)",
    values: [
      false,
      `${P.solo.endClientLimit} end-clients`,
      `${P.pro.endClientLimit} end-clients`,
      "Unlimited",
    ],
  },
  { label: "CSV export", values: [false, true, true, true] },
  { label: "Analytics dashboard", values: [false, true, true, true] },
  { label: "White-label sender (no Inlet footer)", values: [false, false, true, true] },
  { label: "Priority deliverability (SMTP rotation)", values: [false, false, true, true] },
  { label: "Data retention", values: ["30 days", "1 year", "Unlimited", "Unlimited"] },
  { label: "Priority support", values: [false, false, false, true] },
  { label: "Dedicated sending-domain setup (DKIM/SPF)", values: [false, false, false, true] },
];

function Cell({ v }: { v: string | boolean }) {
  if (v === true) return <Check className="h-5 w-5 text-emerald-600" aria-label="Included" />;
  if (v === false) return <Minus className="h-5 w-5 text-slate-300" aria-label="Not included" />;
  return <span className="text-sm text-slate-700">{v}</span>;
}

function PlanCard({
  name,
  price,
  blurb,
  features,
  cta,
  href,
  highlight = false,
  external = false,
}: {
  name: string;
  price: number;
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
      {highlight && (
        <div className="absolute -top-3 left-7 inline-flex items-center rounded-md bg-cyan-400 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-950">
          Most popular
        </div>
      )}
      <h2 className="relative text-base font-bold">{name}</h2>
      <div className="relative mt-4 flex items-baseline gap-1.5">
        <span className="text-4xl font-extrabold tracking-tight">${price}</span>
        <span className={highlight ? "text-sm text-slate-400" : "text-sm text-slate-500"}>/ month</span>
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

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([productJsonLd, faqJsonLd]) }}
      />
      <div className="min-h-screen bg-white text-slate-900 font-sans">
        <ScrollProgress />
        <NavBar />

        <header className="relative overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:26px_26px] [mask-image:radial-gradient(ellipse_55%_60%_at_50%_0%,#000_50%,transparent_100%)]" />
            <div className="aurora-a absolute -top-20 left-1/3 h-72 w-72 rounded-full bg-blue-500/15 blur-[110px]" />
            <div className="aurora-b absolute -top-8 right-1/3 h-64 w-64 rounded-full bg-cyan-400/12 blur-[110px]" />
          </div>
          <div className="mx-auto max-w-3xl px-6 pt-16 pb-10 text-center lg:pt-24">
            <Kicker center tone="light" className="mb-5">Pricing · usage-based, not per-form</Kicker>
            <h1 className="text-balance text-4xl font-extrabold tracking-tight sm:text-6xl">
              Pay for leads, <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text font-serif italic text-transparent">not per form.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-600">
              One backend for every site you build. Start free in two minutes — upgrade
              only when your lead volume does.
            </p>
          </div>
        </header>

        {/* Plans — Good / Better / Best (+ anchor) */}
        <section className="mx-auto grid max-w-6xl gap-5 px-6 pb-14 md:grid-cols-2 xl:grid-cols-4">
          <PlanCard
            name="Free"
            price={0}
            blurb="Prove it works. Run a real site on it."
            features={[
              `${P.free.formLimit} forms · ${P.free.submissionsPerMonth} submissions/mo`,
              `${P.free.emailsPerDay} emails/day`,
              "Full anti-spam stack",
              "Branded auto-replies",
              "1 AI trial message",
            ]}
            cta="Start free"
            href="/client/signup"
          />
          <PlanCard
            name="Solo"
            price={P.solo.priceMonthly}
            blurb="For a freelancer with a handful of sites."
            features={[
              `${P.solo.formLimit} forms · ${fmt(P.solo.submissionsPerMonth)} submissions/mo`,
              `${P.solo.emailsPerDay} emails/day`,
              "CSV export + analytics",
              "Custom email sender + reply-to",
              "AI assistant — 100/month",
              "1-year data retention",
            ]}
            cta="Choose Solo"
            href={UPGRADE_MAILTO("Solo")}
            external
          />
          <PlanCard
            name="Pro"
            price={P.pro.priceMonthly}
            blurb="For agencies. Unlimited forms, your brand only."
            highlight
            features={[
              `Unlimited forms · ${fmt(P.pro.submissionsPerMonth)} submissions/mo`,
              `${P.pro.emailsPerDay} emails/day`,
              "White-label sender — no Inlet footer",
              "Unlimited AI assistant",
              "Priority deliverability (SMTP rotation)",
              "Unlimited data retention",
            ]}
            cta="Upgrade to Pro"
            href={UPGRADE_MAILTO("Pro")}
            external
          />
          <PlanCard
            name="Max"
            price={P.max.priceMonthly}
            blurb="High-volume studios that live on leads."
            features={[
              `Unlimited forms · ${fmt(P.max.submissionsPerMonth)} submissions/mo`,
              `${fmt(P.max.emailsPerDay)} emails/day`,
              "Everything in Pro",
              "Priority support",
              "Dedicated sending-domain setup (DKIM/SPF)",
            ]}
            cta="Go Max"
            href={UPGRADE_MAILTO("Max")}
            external
          />
        </section>

        <p className="mx-auto -mt-6 max-w-2xl px-6 pb-12 text-center text-xs text-slate-400">
          Self-serve checkout is coming — paid upgrades are activated same-day by email.
          Over quota? Your leads keep being stored; only outgoing email pauses.
        </p>

        {/* Full comparison */}
        <section className="mx-auto max-w-5xl px-6 pb-16">
          <h2 className="mb-6 text-center text-2xl font-bold tracking-tight">Compare everything</h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-medium">Capability</th>
                  <th className="px-5 py-4 font-medium">Free</th>
                  <th className="px-5 py-4 font-medium">Solo $9</th>
                  <th className="px-5 py-4 font-semibold text-slate-900">Pro $19</th>
                  <th className="px-5 py-4 font-medium">Max $49</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ROWS.map((r) => (
                  <tr key={r.label}>
                    <td className="px-5 py-3.5 font-medium text-slate-800">{r.label}</td>
                    {r.values.map((v, i) => (
                      <td key={i} className={`px-5 py-3.5 ${i === 2 ? "bg-blue-50/40" : ""}`}>
                        <Cell v={v} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-center text-sm text-slate-500">
            Every plan is self-hosted on your own infrastructure — your data never belongs to us.
          </p>
        </section>

        {/* Pricing FAQ */}
        <section className="border-t border-slate-100 bg-slate-50/60 py-16">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="mb-8 text-center text-2xl font-bold tracking-tight">Pricing questions</h2>
            <div className="space-y-3">
              {FAQ.map((f) => (
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
        <SiteFooter />
      </div>
    </>
  );
}
