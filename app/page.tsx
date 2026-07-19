import Link from "next/link";
import {
  Shield, Zap, Inbox, Palette, BarChart3, ArrowRight, Check, X,
  FileDown, RefreshCw, Terminal, Globe, Lock,
} from "lucide-react";
import { NavBar } from "@/components/marketing/NavBar";
import { Kicker } from "@/components/marketing/Kicker";
import { getLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import HeroPreview from "@/components/marketing/HeroPreview";
import { LogoBadge } from "@/components/Logo";
import AiChat from "@/components/AiChat";
import LazyDemoFlow from "@/components/LazyDemoFlow";
import CopyButton from "@/components/CopyButton";
import Reveal from "@/components/Reveal";
import { Magnetic, Tilt, SpotlightCard, ScrollProgress } from "@/components/marketing/Interactive";

const SITE_URL = "https://forms-central-h1ee.vercel.app";
const SITE_NAME = "Inlet";

/* ---------------------------------------------------------------- FAQ data
   Single source of truth: rendered in the page AND in FAQPage JSON-LD.
   FAQ schema is the highest-impact structured data for AI citations. */
const FAQ: { q: string; a: string }[] = [
  {
    q: "Do my websites need SMTP credentials or an email library?",
    a: "No. SMTP is configured once inside the service. Your websites only POST their form fields to a form URL — they hold no email credentials and import no mailer. This is the core difference from wiring email into every site.",
  },
  {
    q: "Can it send email without a verified domain?",
    a: "Yes. With a single verified sender (for example via Brevo) you can send to anyone — no full domain setup required. A custom domain with DKIM/SPF improves deliverability at scale, but is optional to start.",
  },
  {
    q: "Which frameworks and stacks does it support?",
    a: "Any browser JavaScript environment: Astro, Next.js, Nuxt, Vue, Svelte, or plain static HTML. You copy one small submit helper (or a standard HTML form) and point it at your form URL.",
  },
  {
    q: "How does it stop spam?",
    a: "Four layers: a hidden honeypot field, a cryptographic proof-of-work challenge that costs bots CPU, an NLP keyword filter, and reverse-DNS blocking of VPN/cloud hosts. Blocked attempts are logged, never delivered.",
  },
  {
    q: "How is this different from Formspree, Basin, or Jotform?",
    a: "It is self-hosted on your own Supabase and Vercel, so you own the data. It is multi-tenant and white-label — one backend serves many client sites, each with its own branded emails. It is developer-first (code integration), not a drag-and-drop builder.",
  },
  {
    q: "What happens to file uploads?",
    a: "Base64 file payloads are intercepted, uploaded to storage, and replaced with clean download links inside the notification email — so attachments never trip spam filters or bloat inboxes.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: SITE_NAME,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      url: SITE_URL,
      description:
        "Self-hosted form backend that centralizes submissions from all your sites into one dashboard — no SMTP, no per-site setup. White-labeled auto-reply emails, AI + proof-of-work spam blocking, CSV exports.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "Centralized submissions dashboard",
        "No SMTP in consumer apps",
        "Multi-tenant white-label emails",
        "AI + proof-of-work spam protection",
        "CSV lead export",
        "Automatic SMTP fallback rotation",
      ],
    },
    {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      founder: { "@type": "Person", name: "King_E" },
    },
    {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

const SNIPPET = `// 1. Get a proof-of-work challenge, solve it, POST your fields.
const API_URL = process.env.FORM_API_URL;   // the service
const FORM_ID = process.env.FORM_ID;         // one form's UUID

async function submitForm(fields) {
  const c = await (await fetch(\`\${API_URL}/api/challenge\`)).json();
  let nonce = 0;
  while (!(await sha256(\`\${c.challenge}:\${nonce}\`)).startsWith("0".repeat(c.difficulty))) nonce++;
  return fetch(\`\${API_URL}/api/submit/\${FORM_ID}\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...fields, pow_challenge: c.challenge, pow_timestamp: c.timestamp, pow_nonce: String(nonce) }),
  });
}
// No SMTP. No email library. No backend to run. That's the whole integration.`;

export default async function Home() {
  const locale = await getLocale();
  const d = getDictionary(locale);
  const t = d.hero;
  const L = d.landing;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-white text-slate-900 font-sans">
        <ScrollProgress />
        <NavBar variant="dark" />

        {/* ---------------- Hero — dark-first, the brand's opening frame ---------------- */}
        <header className="relative overflow-hidden bg-slate-950 pb-28 text-white">
          {/* Texture + aurora */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            {/* deep radial base — lifts it off flat navy */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,#1e293b_0%,#0b1120_45%,#020617_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:38px_38px] [mask-image:radial-gradient(ellipse_65%_55%_at_50%_0%,#000_40%,transparent_100%)]" />
            <div className="aurora-a absolute -top-28 left-[18%] h-[440px] w-[440px] rounded-full bg-blue-600/30 blur-[130px]" />
            <div className="aurora-b absolute -top-16 right-[16%] h-[400px] w-[400px] rounded-full bg-cyan-500/20 blur-[130px]" />
            <div className="aurora-a absolute top-44 left-1/2 h-[320px] w-[680px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[140px]" />
            {/* film grain — the texture layer every reference site uses */}
            <div
              className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }}
            />
          </div>

          {/* Cursor-reactive glow across the whole hero */}
          <SpotlightCard glow="rgba(56,189,248,0.07)" size={900} className="relative">
            <div className="relative mx-auto max-w-4xl px-6 pt-14 pb-9 text-center lg:pt-[4.5rem] fade-up">
              <Kicker center className="mb-6">{t.kicker}</Kicker>
              <h1 className="text-balance text-5xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-[5.25rem]">
                {t.titleLead} <span className="shimmer-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text font-serif italic text-transparent">{t.titleAccent}</span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-balance text-lg leading-8 text-slate-300">
                {t.subtitle}
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Magnetic>
                  <Link href="/client/signup" className="btn-shine btn-shine-soft inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-base font-semibold text-slate-950 shadow-lg shadow-cyan-500/10 transition-all duration-300 hover:bg-slate-100 hover:shadow-xl hover:shadow-cyan-400/20">
                    {t.ctaPrimary} <ArrowRight className="cta-arrow h-4 w-4" />
                  </Link>
                </Magnetic>
                <Magnetic strength={0.18}>
                  <a href="#how" className="btn-shine inline-flex h-12 items-center gap-2 rounded-full border border-white/20 px-7 text-base font-medium text-white transition-all duration-300 hover:bg-white/10">
                    {t.ctaSecondary}
                  </a>
                </Magnetic>
              </div>
              <p className="mt-5 text-xs text-slate-500">{t.reassure}</p>
            </div>

            {/* The inlet: streams flowing down into the product */}
            <div aria-hidden className="pointer-events-none relative mx-auto -mb-6 h-14 max-w-3xl">
              <svg viewBox="0 0 600 56" className="h-full w-full overflow-visible opacity-60" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="heroStream" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
                  </linearGradient>
                </defs>
                <path d="M120 0 C 150 30, 240 36, 300 52" fill="none" stroke="url(#heroStream)" strokeWidth="1.5" className="flow-dash" />
                <path d="M300 0 L300 52" fill="none" stroke="url(#heroStream)" strokeWidth="1.5" className="flow-dash" style={{ animationDelay: "-0.3s" }} />
                <path d="M480 0 C 450 30, 360 36, 300 52" fill="none" stroke="url(#heroStream)" strokeWidth="1.5" className="flow-dash" style={{ animationDelay: "-0.6s" }} />
              </svg>
            </div>

            {/* Product preview — glowing frame, floats on idle, tilts under the cursor */}
            <div className="animate-float relative">
              <div aria-hidden className="pointer-events-none absolute left-1/2 top-8 h-56 w-[560px] -translate-x-1/2 rounded-full bg-cyan-500/15 blur-[100px]" />
              <Tilt max={6} className="rounded-3xl">
                <HeroPreview />
              </Tilt>
            </div>

            {/* Framework marquee */}
            <div className="relative mx-auto max-w-5xl px-6 pt-14 fade-up" style={{ animationDelay: "120ms" }}>
              <p className="mb-5 text-center text-xs font-semibold uppercase tracking-widest text-slate-500">{t.stack}</p>
              <div className="marquee-mask relative overflow-hidden">
                <div className="flex w-max animate-marquee gap-3">
                  {[...Array(2)].flatMap((_, copy) =>
                    ["Astro", "Next.js", "Nuxt", "Vue", "Svelte", "SvelteKit", "Remix", "React", "Solid", "Qwik", "Angular", "Plain HTML"].map((s) => (
                      <span key={`${copy}-${s}`} className="inline-flex shrink-0 items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur">
                        {s}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </SpotlightCard>
        </header>

        {/* ---------------- The wedge: no SMTP (light sheet slides over the dark hero) ---------------- */}
        <div className="relative -mt-10 rounded-t-[2.5rem] bg-white">
        <section className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Kicker tone="light" className="mb-4">{L.wedge.kicker}</Kicker>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {L.wedge.title}
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                {L.wedge.bodyA} <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">FORM_API_URL</code> {L.wedge.bodyAnd} <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">FORM_ID</code>. {L.wedge.bodyB}
              </p>
              <ul className="mt-6 space-y-3 text-slate-700">
                {L.wedge.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-rose-500/70" />
                <span className="h-3 w-3 rounded-full bg-amber-500/70" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/70" />
                <span className="ml-2 inline-flex items-center gap-1.5 text-xs text-slate-400"><Terminal className="h-3.5 w-3.5" /> submit.js</span>
                <CopyButton text={SNIPPET} />
              </div>
              <pre className="overflow-x-auto p-5 text-[13px] leading-relaxed text-slate-200"><code>{SNIPPET}</code></pre>
            </div>
          </div>
        </section>
        </div>

        {/* ---------------- Playable demo ---------------- */}
        <LazyDemoFlow dict={L.demo} />

        {/* ---------------- Features (dark band) ---------------- */}
        <section id="features" className="relative overflow-hidden bg-slate-950 py-24 text-white">
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-64 w-[820px] -translate-x-1/2 rounded-full bg-blue-500/15 blur-[130px]" />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_40%,transparent_100%)]" />
          <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
            <Reveal className="mb-14 max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-400"><Shield className="h-4 w-4" /> {L.features.kicker}</div>
              <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">{L.features.title}</h2>
              <p className="mt-4 text-lg text-slate-400">{L.features.subtitle}</p>
            </Reveal>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3 auto-rows-[240px]">
              {[
                { icon: Inbox, cls: "md:col-span-2", color: "text-blue-400", bg: "bg-blue-500/15", glow: "rgba(59,130,246,0.16)" },
                { icon: Shield, cls: "", color: "text-emerald-400", bg: "bg-emerald-500/15", glow: "rgba(16,185,129,0.16)" },
                { icon: Palette, cls: "", color: "text-violet-400", bg: "bg-violet-500/15", glow: "rgba(139,92,246,0.16)" },
                { icon: BarChart3, cls: "md:col-span-2", color: "text-indigo-400", bg: "bg-indigo-500/15", glow: "rgba(99,102,241,0.16)" },
                { icon: FileDown, cls: "", color: "text-slate-200", bg: "bg-white/10", glow: "rgba(255,255,255,0.10)" },
                { icon: RefreshCw, cls: "", color: "text-amber-400", bg: "bg-amber-500/15", glow: "rgba(245,158,11,0.16)" },
                { icon: Globe, cls: "", color: "text-cyan-400", bg: "bg-cyan-500/15", glow: "rgba(34,211,238,0.16)" },
              ].map((f, i) => (
                <div
                  key={i}
                  className={`group relative rounded-3xl p-px transition-transform duration-300 hover:-translate-y-1 ${f.cls}`}
                  style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.16), rgba(255,255,255,0.02) 42%, transparent)" }}
                >
                  <SpotlightCard
                    glow={f.glow}
                    className="flex h-full flex-col overflow-hidden rounded-[23px] bg-slate-900/70 p-7 transition-colors duration-300 group-hover:bg-slate-900"
                  >
                    <div className={`relative mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl ${f.bg} ring-1 ring-inset ring-white/10 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}>
                      <f.icon className={`h-5 w-5 ${f.color}`} />
                    </div>
                    <h3 className="relative mb-1.5 text-lg font-bold">{L.features.cards[i].title}</h3>
                    <p className="relative max-w-sm text-sm leading-relaxed text-slate-400">{L.features.cards[i].desc}</p>
                    <f.icon className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 text-white opacity-[0.04] transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110" />
                  </SpotlightCard>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- How it works ---------------- */}
        <section id="how" className="relative overflow-hidden border-y border-slate-100 bg-gradient-to-b from-slate-50 to-white py-24">
          <div aria-hidden className="pointer-events-none absolute right-[18%] top-8 h-72 w-72 rounded-full bg-blue-400/10 blur-[110px]" />
          <div aria-hidden className="pointer-events-none absolute left-[12%] bottom-8 h-56 w-56 rounded-full bg-violet-400/10 blur-[110px]" />
          <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
            <Reveal className="mb-16 max-w-2xl">
              <Kicker tone="light" className="mb-4">{L.how.kicker}</Kicker>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{L.how.title}</h2>
              <p className="mt-4 text-lg text-slate-600">{L.how.subtitle}</p>
            </Reveal>
            <div className="relative grid gap-8 md:grid-cols-3">
              <div aria-hidden className="pointer-events-none absolute left-[16%] right-[16%] top-6 hidden h-px bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0 md:block" />
              {L.how.steps.map((s, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <SpotlightCard
                    glow="rgba(59,130,246,0.10)"
                    className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10"
                  >
                    <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 font-mono text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">{String(i + 1).padStart(2, "0")}</div>
                    <h3 className="relative mt-5 text-xl font-bold text-slate-900">{s.t}</h3>
                    <p className="relative mt-2 text-sm leading-relaxed text-slate-600">{s.d}</p>
                  </SpotlightCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- Comparison ---------------- */}
        <section id="compare" className="mx-auto max-w-5xl px-6 py-24 lg:px-8">
          <Reveal className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{L.compare.title}</h2>
            <p className="mt-4 text-lg text-slate-600">{L.compare.subtitle}</p>
          </Reveal>
          <Reveal>
            <div className="overflow-x-auto rounded-3xl border border-slate-200 shadow-sm">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-5 font-medium text-slate-400">{L.compare.capability}</th>
                    <th className="bg-blue-50/50 px-6 py-5 text-center">
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-3 py-1 text-xs font-bold text-white shadow-sm">{SITE_NAME}</span>
                    </th>
                    <th className="px-6 py-5 text-center font-medium text-slate-500">Formspree / Basin</th>
                    <th className="px-6 py-5 text-center font-medium text-slate-500">Jotform</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {([
                    [L.compare.rows[0], true, false, false],
                    [L.compare.rows[1], true, true, false],
                    [L.compare.rows[2], true, false, false],
                    [L.compare.rows[3], true, false, false],
                    [L.compare.rows[4], true, true, false],
                    [L.compare.rows[5], true, false, false],
                  ] as [string, boolean, boolean, boolean][]).map(([label, a, b, c]) => (
                    <tr key={label as string} className="transition-colors hover:bg-slate-50/60">
                      <td className="px-6 py-4 font-medium text-slate-800">{label}</td>
                      <td className="bg-blue-50/40 px-6 py-4 text-center">
                        {a ? <Check className="mx-auto h-5 w-5 text-blue-600" strokeWidth={2.5} /> : <X className="mx-auto h-5 w-5 text-slate-300" />}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {b ? <Check className="mx-auto h-5 w-5 text-emerald-600" /> : <X className="mx-auto h-5 w-5 text-slate-300" />}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {c ? <Check className="mx-auto h-5 w-5 text-emerald-600" /> : <X className="mx-auto h-5 w-5 text-slate-300" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </section>

        {/* ---------------- FAQ ---------------- */}
        <section id="faq" className="border-t border-slate-100 bg-gradient-to-b from-white to-slate-50 py-24">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            <Reveal className="mb-12 text-center">
              <Kicker center tone="light" className="mb-4">{L.faq.kicker}</Kicker>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{L.faq.title}</h2>
            </Reveal>
            <div className="space-y-3">
              {L.faq.items.map((f) => (
                <details key={f.q} className="group rounded-2xl border border-slate-200 bg-white p-5 transition-colors open:border-blue-200 open:shadow-md hover:border-slate-300">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900">
                    {f.q}
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all group-open:bg-blue-600 group-open:text-white">
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-open:rotate-90" />
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- Final CTA ---------------- */}
        <section className="relative overflow-hidden bg-slate-950 py-24 text-center text-white">
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-blue-500/25 blur-[120px]" />
          <div className="relative mx-auto max-w-2xl px-6">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">{L.cta.title}</h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-slate-300">{L.cta.subtitle}</p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Magnetic>
                <Link href="/client/signup" className="btn-shine btn-shine-soft inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-base font-medium text-slate-900 transition-all duration-300 hover:bg-slate-100 hover:shadow-lg hover:shadow-white/10">
                  {L.cta.primary} <ArrowRight className="cta-arrow h-4 w-4" />
                </Link>
              </Magnetic>
              <Magnetic strength={0.18}>
                <a href="/docs" className="btn-shine inline-flex h-12 items-center gap-2 rounded-full border border-white/20 px-7 text-base font-medium text-white transition-all duration-300 hover:bg-white/10">
                  {L.cta.secondary}
                </a>
              </Magnetic>
            </div>
          </div>
        </section>

        {/* ---------------- Footer ---------------- */}
        <footer className="border-t border-slate-200 bg-white py-12">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 text-sm text-slate-500 sm:flex-row lg:px-8">
            <div className="flex items-center gap-2.5">
              <LogoBadge className="h-7 w-7 rounded-lg" />
              <span className="font-semibold text-slate-800">{SITE_NAME}</span>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <a href="#features" className="link-underline hover:text-slate-900 transition-colors">{L.footer.features}</a>
              <a href="#how" className="link-underline hover:text-slate-900 transition-colors">{L.footer.how}</a>
              <Link href="/pricing" className="link-underline hover:text-slate-900 transition-colors">{L.footer.pricing}</Link>
              <a href="#compare" className="link-underline hover:text-slate-900 transition-colors">{L.footer.compare}</a>
              <a href="#faq" className="link-underline hover:text-slate-900 transition-colors">{L.footer.faq}</a>
              <Link href="/client/login" className="link-underline hover:text-slate-900 transition-colors">{L.footer.signIn}</Link>
            </nav>
            <p>&copy; {new Date().getFullYear()} {SITE_NAME}</p>
          </div>
        </footer>

        <AiChat />
      </div>
    </>
  );
}
