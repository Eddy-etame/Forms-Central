import Link from "next/link";
import {
  Shield, Zap, Inbox, Palette, BarChart3, ArrowRight, Check, X,
  FileDown, RefreshCw, Terminal, Globe, Lock, Sparkles,
} from "lucide-react";

const SITE_URL = "https://logiciel-formulaire.vercel.app";
const SITE_NAME = "Microdidact Forms";

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

function NavBar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 font-bold text-white shadow-sm">M</div>
          <span className="font-semibold tracking-tight text-slate-900">{SITE_NAME}</span>
        </Link>
        <div className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
          <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
          <a href="#how" className="hover:text-slate-900 transition-colors">How it works</a>
          <a href="#compare" className="hover:text-slate-900 transition-colors">Compare</a>
          <a href="#faq" className="hover:text-slate-900 transition-colors">FAQ</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/client/login" className="hidden text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors sm:block">Sign in</Link>
          <Link href="/client/login" className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 transition-colors">
            Get started <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-white text-slate-900 font-sans">
        <NavBar />

        {/* ---------------- Hero ---------------- */}
        <header className="relative overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:22px_22px]" />
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-blue-500/15 blur-[120px]" />

          <div className="mx-auto max-w-4xl px-6 pt-20 pb-16 text-center lg:pt-28 fade-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-600 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-blue-500" />
              Self-hosted form backend · you own the data
            </div>
            <h1 className="text-balance text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl">
              One form backend for <span className="bg-gradient-to-r from-blue-600 to-slate-900 bg-clip-text text-transparent">all your websites.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-8 text-slate-600">
              Centralize submissions from every site into one dashboard — with <strong className="text-slate-900">no SMTP and no per-site setup</strong>. Branded auto-reply emails, AI + proof-of-work spam blocking, CSV exports. The privacy-first alternative to Formspree and Jotform.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/client/login" className="inline-flex h-12 items-center gap-2 rounded-full bg-slate-900 px-7 text-base font-medium text-white shadow-lg hover:bg-slate-800 transition-colors">
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#how" className="inline-flex h-12 items-center gap-2 rounded-full border border-slate-200 bg-white px-7 text-base font-medium text-slate-800 hover:border-slate-300 transition-colors">
                See how it works
              </a>
            </div>
            <p className="mt-5 text-xs text-slate-400">No credit card · no SMTP config · integrate in 2 minutes</p>
          </div>

          {/* Framework strip */}
          <div className="mx-auto max-w-3xl px-6 pb-16 fade-up" style={{ animationDelay: "120ms" }}>
            <p className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">Drop into any stack</p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-medium text-slate-500">
              <span>Astro</span><span>Next.js</span><span>Nuxt</span><span>Vue</span><span>Svelte</span><span>Plain HTML</span>
            </div>
          </div>
        </header>

        {/* ---------------- The wedge: no SMTP ---------------- */}
        <section className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
                <Lock className="h-4 w-4" /> The whole integration
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Two values. Zero email plumbing.
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                Every other form tool makes you wire SMTP or an email SDK into each site. Here, your site holds <strong>nothing</strong> — just a <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">FORM_API_URL</code> and a <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">FORM_ID</code>. The service does delivery, spam filtering, and the branded auto-reply.
              </p>
              <ul className="mt-6 space-y-3 text-slate-700">
                {["No SMTP credentials in your frontend", "No email library to install", "No backend for you to run", "Copy-paste helper works everywhere"].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> {t}
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
              </div>
              <pre className="overflow-x-auto p-5 text-[13px] leading-relaxed text-slate-200"><code>{SNIPPET}</code></pre>
            </div>
          </div>
        </section>

        {/* ---------------- Features ---------------- */}
        <section id="features" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="mb-14 max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Built for deliverability and scale</h2>
            <p className="mt-4 text-lg text-slate-600">One backend, many client sites — each with its own branding, all protected and centralized.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 auto-rows-[240px]">
            {[
              { icon: Inbox, title: "Centralized inbox", desc: "Every submission from every site lands in one dashboard with live status.", cls: "md:col-span-2", color: "text-blue-600", bg: "bg-blue-50" },
              { icon: Shield, title: "AI + PoW anti-spam", desc: "Honeypot, proof-of-work, NLP filter, reverse-DNS VPN block.", cls: "", color: "text-emerald-600", bg: "bg-emerald-50" },
              { icon: Palette, title: "White-label emails", desc: "Auto-reply emails adapt to each client's logo, colors and name.", cls: "", color: "text-purple-600", bg: "bg-purple-50" },
              { icon: BarChart3, title: "Client analytics", desc: "Per-client dashboards so each site owner tracks their own leads and conversion in real time.", cls: "md:col-span-2", color: "text-indigo-600", bg: "bg-indigo-50" },
              { icon: FileDown, title: "CSV export", desc: "One click flattens dynamic fields into clean columns.", cls: "", color: "text-slate-700", bg: "bg-slate-100" },
              { icon: RefreshCw, title: "SMTP fallback", desc: "Rotates through backup credentials so a lead is never lost.", cls: "", color: "text-amber-600", bg: "bg-amber-50" },
              { icon: Globe, title: "Any framework", desc: "Astro, Next, Nuxt, Vue, Svelte, or plain HTML.", cls: "", color: "text-cyan-600", bg: "bg-cyan-50" },
            ].map((f) => (
              <div key={f.title} className={`group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 transition-shadow hover:shadow-xl ${f.cls}`}>
                <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl ${f.bg}`}>
                  <f.icon className={`h-5 w-5 ${f.color}`} />
                </div>
                <h3 className="mb-1.5 text-lg font-bold text-slate-900">{f.title}</h3>
                <p className="max-w-sm text-sm leading-relaxed text-slate-600">{f.desc}</p>
                <f.icon className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 text-slate-900 opacity-[0.03] transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110" />
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- How it works ---------------- */}
        <section id="how" className="border-y border-slate-100 bg-slate-50/60 py-20">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="mb-14 max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Live in three steps</h2>
              <p className="mt-4 text-lg text-slate-600">From zero to receiving branded lead emails — in minutes.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                { n: "01", t: "Create a form", d: "Add a form in the admin, pick its brand, copy its unique ID." },
                { n: "02", t: "Paste the snippet", d: "Drop the two env values and the submit helper into any site." },
                { n: "03", t: "Receive & manage", d: "Owner gets a notification, submitter gets a branded auto-reply, you see it live." },
              ].map((s) => (
                <div key={s.n} className="rounded-3xl border border-slate-200 bg-white p-7">
                  <div className="font-mono text-sm font-semibold text-blue-600">{s.n}</div>
                  <div className="mt-2 h-px w-10 bg-slate-200" />
                  <h3 className="mt-5 text-xl font-bold text-slate-900">{s.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- Comparison ---------------- */}
        <section id="compare" className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Why teams switch</h2>
            <p className="mt-4 text-lg text-slate-600">Self-hosted, multi-tenant, and developer-first.</p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Capability</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">{SITE_NAME}</th>
                  <th className="px-6 py-4 font-medium">Formspree / Basin</th>
                  <th className="px-6 py-4 font-medium">Jotform</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  ["Self-hosted, own your data", true, false, false],
                  ["No SMTP in your sites", true, true, false],
                  ["Multi-tenant white-label emails", true, false, false],
                  ["Proof-of-work + NLP anti-spam", true, false, false],
                  ["Developer-first integration", true, true, false],
                  ["One backend for many sites", true, false, false],
                ].map(([label, a, b, c]) => (
                  <tr key={label as string}>
                    <td className="px-6 py-4 font-medium text-slate-800">{label}</td>
                    {[a, b, c].map((v, i) => (
                      <td key={i} className="px-6 py-4">
                        {v ? <Check className="h-5 w-5 text-emerald-600" /> : <X className="h-5 w-5 text-slate-300" />}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ---------------- FAQ ---------------- */}
        <section id="faq" className="border-t border-slate-100 bg-slate-50/60 py-20">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Frequently asked</h2>
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

        {/* ---------------- Final CTA ---------------- */}
        <section className="relative overflow-hidden bg-slate-950 py-24 text-center text-white">
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-blue-500/25 blur-[120px]" />
          <div className="relative mx-auto max-w-2xl px-6">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Ship forms today. Own them forever.</h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-slate-300">One backend for every site you build — no SMTP, no lock-in, your data.</p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/client/login" className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-base font-medium text-slate-900 hover:bg-slate-100 transition-colors">
                Get started free <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#how" className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 px-7 text-base font-medium text-white hover:bg-white/10 transition-colors">
                Read the docs
              </a>
            </div>
          </div>
        </section>

        {/* ---------------- Footer ---------------- */}
        <footer className="border-t border-slate-200 bg-white py-12">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 text-sm text-slate-500 sm:flex-row lg:px-8">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">M</div>
              <span className="font-semibold text-slate-800">{SITE_NAME}</span>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
              <a href="#how" className="hover:text-slate-900 transition-colors">How it works</a>
              <a href="#compare" className="hover:text-slate-900 transition-colors">Compare</a>
              <a href="#faq" className="hover:text-slate-900 transition-colors">FAQ</a>
              <Link href="/client/login" className="hover:text-slate-900 transition-colors">Sign in</Link>
            </nav>
            <p>&copy; {new Date().getFullYear()} {SITE_NAME}</p>
          </div>
        </footer>
      </div>
    </>
  );
}
