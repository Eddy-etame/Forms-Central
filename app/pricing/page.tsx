import type { Metadata } from "next";
import Link from "next/link";
import { Check, Minus, ArrowRight, Sparkles } from "lucide-react";
import { NavBar, SiteFooter } from "@/components/marketing/NavBar";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "King E Forms pricing — start free, upgrade to Pro for unlimited AI assistance, white-label emails, CSV export, analytics and priority deliverability. Self-hosted: you own the data.",
  alternates: { canonical: "/pricing" },
};

const UPGRADE_MAILTO =
  "mailto:eddy.eetame@gmail.com?subject=King%20E%20Forms%20Pro%20upgrade&body=Hi%2C%20I%27d%20like%20to%20upgrade%20my%20King%20E%20Forms%20account%20to%20Pro.%20My%20account%20email%20is%3A%20";

type Row = { label: string; free: string | boolean; pro: string | boolean };
const ROWS: Row[] = [
  { label: "Forms", free: "Up to 3", pro: "Unlimited" },
  { label: "Submissions", free: "100 / month", pro: "10,000 / month" },
  { label: "Spam protection (honeypot + proof-of-work + NLP)", free: true, pro: true },
  { label: "Branded auto-reply emails", free: true, pro: true },
  { label: "AI assistant", free: "1 trial message", pro: "Unlimited" },
  { label: "White-label sender (no King E Forms footer)", free: false, pro: true },
  { label: "CSV lead export", free: false, pro: true },
  { label: "Analytics dashboard", free: false, pro: true },
  { label: "Priority deliverability (SMTP fallback rotation)", free: false, pro: true },
  { label: "Data retention", free: "30 days", pro: "Unlimited" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "King E Forms",
  description: "Self-hosted form backend for all your websites.",
  brand: { "@type": "Brand", name: "King E Forms" },
  offers: [
    { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
    { "@type": "Offer", name: "Pro", price: "19", priceCurrency: "USD" },
  ],
};

function Cell({ v }: { v: string | boolean }) {
  if (v === true) return <Check className="h-5 w-5 text-emerald-600" aria-label="Included" />;
  if (v === false) return <Minus className="h-5 w-5 text-slate-300" aria-label="Not included" />;
  return <span className="text-sm text-slate-700">{v}</span>;
}

export default function PricingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-white text-slate-900 font-sans">
        <NavBar />

        <header className="mx-auto max-w-3xl px-6 pt-16 pb-10 text-center lg:pt-24">
          <h1 className="text-balance text-4xl font-extrabold tracking-tight sm:text-6xl">
            Simple pricing. <span className="bg-gradient-to-r from-blue-600 to-slate-900 bg-clip-text text-transparent">Own your data.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-600">
            Start free in two minutes. Upgrade when your leads do. No per-form pricing games.
          </p>
        </header>

        {/* Plans */}
        <section className="mx-auto grid max-w-4xl gap-6 px-6 pb-16 md:grid-cols-2">
          {/* Free */}
          <div className="flex flex-col rounded-3xl border border-slate-200 bg-white p-8">
            <h2 className="text-lg font-bold">Free</h2>
            <p className="mt-1 text-sm text-slate-500">Everything you need to stop losing leads.</p>
            <div className="mt-5 flex items-baseline gap-1.5">
              <span className="text-5xl font-extrabold tracking-tight">$0</span>
              <span className="text-sm text-slate-500">/ month</span>
            </div>
            <ul className="mt-6 space-y-2.5 text-sm text-slate-700">
              {["3 forms, 100 submissions / month", "Full anti-spam stack", "Branded auto-reply emails", "1 AI assistant trial message"].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {t}
                </li>
              ))}
            </ul>
            <Link
              href="/client/signup"
              className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-300 px-6 text-sm font-medium text-slate-800 hover:border-slate-400 transition-colors"
            >
              Start free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Pro */}
          <div className="relative flex flex-col rounded-3xl border-2 border-slate-900 bg-slate-950 p-8 text-white shadow-xl">
            <div className="absolute -top-3.5 left-8 inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold">
              <Sparkles className="h-3 w-3" /> Most popular
            </div>
            <h2 className="text-lg font-bold">Pro</h2>
            <p className="mt-1 text-sm text-slate-400">For agencies and multi-site builders.</p>
            <div className="mt-5 flex items-baseline gap-1.5">
              <span className="text-5xl font-extrabold tracking-tight">$19</span>
              <span className="text-sm text-slate-400">/ month</span>
            </div>
            <ul className="mt-6 space-y-2.5 text-sm text-slate-200">
              {[
                "Unlimited forms, 10,000 submissions / month",
                "Unlimited AI assistant",
                "White-label sender — your brand only",
                "CSV export + analytics dashboard",
                "Priority deliverability (SMTP rotation)",
                "Unlimited data retention",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> {t}
                </li>
              ))}
            </ul>
            <a
              href={UPGRADE_MAILTO}
              className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Upgrade to Pro <ArrowRight className="h-4 w-4" />
            </a>
            <p className="mt-3 text-center text-xs text-slate-500">
              Self-serve checkout is coming — upgrades are activated same-day by email.
            </p>
          </div>
        </section>

        {/* Comparison table */}
        <section className="mx-auto max-w-4xl px-6 pb-20">
          <h2 className="mb-6 text-center text-2xl font-bold tracking-tight">Compare plans</h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Capability</th>
                  <th className="px-6 py-4 font-medium">Free</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ROWS.map((r) => (
                  <tr key={r.label}>
                    <td className="px-6 py-4 font-medium text-slate-800">{r.label}</td>
                    <td className="px-6 py-4"><Cell v={r.free} /></td>
                    <td className="px-6 py-4"><Cell v={r.pro} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-center text-sm text-slate-500">
            Both plans are self-hosted on your own infrastructure — your data never belongs to us.
          </p>
        </section>

        <SiteFooter />
      </div>
    </>
  );
}
