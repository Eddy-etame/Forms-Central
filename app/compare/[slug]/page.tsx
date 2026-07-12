import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, X, ArrowRight } from "lucide-react";
import { NavBar, SiteFooter } from "@/components/marketing/NavBar";
import AiChat from "@/components/AiChat";

/**
 * Data-driven competitor comparison pages ("X alternative" search intent).
 * Add a competitor to COMPETITORS and it ships at /compare/<slug>.
 * Claims are factual and fair — no disparagement.
 */

type Row = { label: string; us: boolean | string; them: boolean | string };
type Competitor = {
  slug: string;
  name: string;
  intro: string;
  bestFor: string;
  rows: Row[];
  verdict: string;
};

const COMPETITORS: Competitor[] = [
  {
    slug: "formspree",
    name: "Formspree",
    intro:
      "Formspree is a popular hosted form endpoint for static sites. Inlet solves the same problem — forms without a backend — but self-hosted, multi-tenant, and white-label.",
    bestFor: "Formspree is great for a single site with a single form and zero infrastructure.",
    rows: [
      { label: "No SMTP or email library in your site", us: true, them: true },
      { label: "Self-hosted — you own the submission data", us: true, them: false },
      { label: "One backend serving many client sites", us: true, them: "Per-form accounts" },
      { label: "White-label auto-reply (client's brand, not ours)", us: true, them: false },
      { label: "Proof-of-work + NLP + reverse-DNS anti-spam", us: true, them: "reCAPTCHA-based" },
      { label: "File uploads become clean download links", us: true, them: "Paid plans" },
      { label: "Runs on your own Supabase + Vercel (free tiers)", us: true, them: false },
    ],
    verdict:
      "If you run one site, Formspree is a fine default. If you build and manage many sites — agencies, freelancers, studios — Inlet centralizes every lead in one dashboard you own, with each client seeing their own brand.",
  },
  {
    slug: "jotform",
    name: "Jotform",
    intro:
      "Jotform is a drag-and-drop form builder with hosted forms. Inlet is developer-first: your forms live in your own site's code and design, and the service handles delivery, spam and branded replies.",
    bestFor: "Jotform is great for non-developers who need a hosted form page quickly.",
    rows: [
      { label: "Forms match your site's exact design (your code)", us: true, them: "Themed builder" },
      { label: "Self-hosted — you own the submission data", us: true, them: false },
      { label: "No iframe / redirect — native forms", us: true, them: "Embeds" },
      { label: "One backend for dozens of client sites", us: true, them: "Per-form workspace" },
      { label: "White-label branded auto-replies", us: true, them: "Enterprise tier" },
      { label: "Developer integration (2 env values + helper)", us: true, them: false },
      { label: "Proof-of-work anti-spam (no CAPTCHA friction)", us: true, them: "CAPTCHA" },
    ],
    verdict:
      "If you need a form page without writing code, use Jotform. If your forms live inside websites you build — and you want them native, branded, and centralized — Inlet is built exactly for that.",
  },
];

export function generateStaticParams() {
  return COMPETITORS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = COMPETITORS.find((x) => x.slug === slug);
  if (!c) return {};
  return {
    title: `${c.name} alternative — Inlet vs ${c.name}`,
    description: `Looking for a ${c.name} alternative? Inlet is a self-hosted, white-label form backend: no SMTP in your sites, proof-of-work anti-spam, one dashboard for every website you run.`,
    alternates: { canonical: `/compare/${c.slug}` },
  };
}

function Cell({ v }: { v: boolean | string }) {
  if (v === true) return <Check className="h-5 w-5 text-emerald-600" aria-label="Yes" />;
  if (v === false) return <X className="h-5 w-5 text-slate-300" aria-label="No" />;
  return <span className="text-sm text-slate-600">{v}</span>;
}

export default async function ComparePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = COMPETITORS.find((x) => x.slug === slug);
  if (!c) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Inlet vs ${c.name}`,
    description: c.intro,
    author: { "@type": "Organization", name: "Inlet" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-white text-slate-900 font-sans">
        <NavBar />

        <main className="mx-auto max-w-3xl px-6 py-16 lg:py-20">
          <p className="text-sm font-semibold text-blue-600">Comparison</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Inlet vs {c.name}
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">{c.intro}</p>
          <p className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-600">
            <strong className="text-slate-900">Fair note:</strong> {c.bestFor}
          </p>

          <div className="mt-10 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[540px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Capability</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Inlet</th>
                  <th className="px-6 py-4 font-medium">{c.name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {c.rows.map((r) => (
                  <tr key={r.label}>
                    <td className="px-6 py-4 font-medium text-slate-800">{r.label}</td>
                    <td className="px-6 py-4"><Cell v={r.us} /></td>
                    <td className="px-6 py-4"><Cell v={r.them} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="mt-12 text-2xl font-bold tracking-tight">The verdict</h2>
          <p className="mt-3 leading-8 text-slate-600">{c.verdict}</p>

          <div className="mt-12 flex flex-col items-center gap-3 rounded-3xl bg-slate-950 p-8 text-center text-white sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h2 className="text-xl font-bold">Try the self-hosted way</h2>
              <p className="mt-1 text-sm text-slate-400">Free to start. Your data stays yours.</p>
            </div>
            <Link
              href="/client/signup"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Start free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </main>

        <AiChat />
        <SiteFooter />
      </div>
    </>
  );
}
