import type { Metadata } from "next";
import Link from "next/link";
import { NavBar, SiteFooter } from "@/components/marketing/NavBar";
import AiChat from "@/components/AiChat";
import { Check, Terminal, ShieldCheck, Mail, ArrowRight, Webhook, Sparkles } from "lucide-react";
import CopyButton from "@/components/CopyButton";
import { Magnetic, ScrollProgress } from "@/components/marketing/Interactive";
import { resolveLocale, buildMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/i18n";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ lang?: string }> }): Promise<Metadata> {
  const { lang } = await searchParams;
  return buildMetadata('docs', await resolveLocale(lang));
}

const HELPER = `// form-service.js — drop into any project (framework-agnostic)
const API_URL = import.meta.env.PUBLIC_FORM_API_URL; // or process.env / hardcode
const FORM_ID = import.meta.env.PUBLIC_FORM_ID;      // UUID from your dashboard

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function submitForm(fields, { lang = "en" } = {}) {
  // 1. Get a proof-of-work challenge
  const c = await (await fetch(\`\${API_URL}/api/challenge\`)).json();

  // 2. Solve it (costs a bot CPU, costs your user ~a blink)
  let nonce = 0;
  const prefix = "0".repeat(c.difficulty);
  while (!(await sha256Hex(\`\${c.challenge}:\${nonce}\`)).startsWith(prefix)) nonce++;

  // 3. Submit the fields
  const res = await fetch(\`\${API_URL}/api/submit/\${FORM_ID}\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...fields,
      _lang: lang,
      _gotcha: "",              // honeypot — leave empty
      pow_challenge: c.challenge,
      pow_timestamp: c.timestamp,
      pow_nonce: String(nonce),
    }),
  });
  if (!res.ok) throw new Error((await res.json()).error ?? "Submission failed");
  return res.json();
}`;

const USAGE = `import { submitForm } from "./form-service";

await submitForm({
  name: "Ada Lovelace",
  email: "ada@example.com",     // used for the branded auto-reply
  message: "I'd like a quote.",
});`;

const LLM_PROMPT = `Read https://forms-central-h1ee.vercel.app/llm-install.md
and integrate Inlet into this project exactly as it instructs.
My values: FORM_API_URL=https://forms-central-h1ee.vercel.app FORM_ID=<paste yours>`;

const WEBHOOK_VERIFY = `// Verify Inlet's webhook signature (Node) — read the RAW body first.
import crypto from "node:crypto";

export function verifyInletWebhook(rawBody, sigHeader, secret, toleranceSec = 300) {
  const p = Object.fromEntries(sigHeader.split(",").map(s => s.split("=")));
  const expected = crypto.createHmac("sha256", secret).update(\`\${p.t}.\${rawBody}\`).digest("hex");
  const fresh = Math.abs(Date.now() / 1000 - Number(p.t)) < toleranceSec;
  return fresh && crypto.timingSafeEqual(Buffer.from(p.v1), Buffer.from(expected));
}`;

// Prose per locale. Code snippets stay English (standard for developer docs).
type DocDict = {
  eyebrow: string; titleLead: string; titleAccent: string; intro: string;
  s1: string; s1intro: string; apiUrlDesc: string; formIdDesc: string;
  s2: string; s2intro: string; s3: string; fields: [string, string][];
  s4: string; s4intro1: string; s4intro2: string; ccLabel: string; ccBody1: string; ccSkill: string; ccBody2: string;
  s5: string; s5intro1: string; s5intro2: string; s5intro3: string; whNote1: string;
  serverTitle: string; spamTitle: string; spamBody: string; emailTitle: string; emailBody: string;
  ctaTitle: string; ctaBtn: string; promptTitle: string;
};
const DOC: Record<Locale, DocDict> = {
  en: {
    eyebrow: "Documentation",
    titleLead: "Integrate in",
    titleAccent: "minutes.",
    intro: "Your website never touches SMTP. It holds two values and calls two endpoints — the service does delivery, spam filtering, and the branded auto-reply.",
    s1: "The two-value contract",
    s1intro: "Create a form in your dashboard and copy its ID. Give your site exactly two values:",
    apiUrlDesc: "The service origin — where challenges and submissions go.",
    formIdDesc: "One form's UUID. Each site (or each form) gets its own.",
    s2: "The copy-paste helper",
    s2intro: "Works in Astro, Next.js, Nuxt, Vue, Svelte, or a plain",
    s3: "Use it",
    fields: [
      ["email field", "if present, the submitter receives your branded auto-reply."],
      ["_lang", '"en" or "fr" — selects the auto-reply language.'],
      ["_gotcha", "hidden honeypot input. Humans leave it empty; bots fill it and get silently dropped."],
      ["files", "send base64 payloads — they are uploaded to storage and arrive as download links."],
    ],
    s4: "Let your AI do it",
    s4intro1: "Using Claude, Cursor, or Copilot? We publish a machine-readable install file at",
    s4intro2: "— paste this prompt and your AI does the whole integration, correctly, on the first try:",
    ccLabel: "Claude Code users:",
    ccBody1: "drop our",
    ccSkill: "skill file",
    ccBody2: "and Claude wires forms, honeypots and webhooks by itself in any project.",
    s5: "Webhooks (optional)",
    s5intro1: "Add a webhook URL to a form and every stored lead is POSTed to your endpoint as",
    s5intro2: "signed Stripe-style in the",
    s5intro3: "header — verify it and reject replays in five lines:",
    whNote1: "Delivery is fire-and-forget with one retry — a down endpoint can never block or lose a lead. Endpoints must be",
    serverTitle: "What happens server-side",
    spamTitle: "Four spam gates.",
    spamBody: "Honeypot, proof-of-work verification, NLP keyword filter, reverse-DNS VPN/cloud blocking. Blocked attempts are logged, never delivered.",
    emailTitle: "Two emails.",
    emailBody: "The owner gets the lead notification; the submitter gets an auto-reply in your client's branding — logo, colors, sender name. SMTP fallback rotation means a failing credential never loses a lead.",
    ctaTitle: "Ready to stop wiring email into every site?",
    ctaBtn: "Start free",
    promptTitle: "prompt.txt — paste into your AI assistant",
  },
  fr: {
    eyebrow: "Documentation",
    titleLead: "Intégrez en",
    titleAccent: "quelques minutes.",
    intro: "Votre site ne touche jamais au SMTP. Il détient deux valeurs et appelle deux endpoints — le service se charge de l'envoi, du filtrage anti-spam et de la réponse automatique à votre image.",
    s1: "Le contrat à deux valeurs",
    s1intro: "Créez un formulaire dans votre tableau de bord et copiez son ID. Donnez à votre site exactement deux valeurs :",
    apiUrlDesc: "L'origine du service — là où partent les défis et les soumissions.",
    formIdDesc: "L'UUID d'un formulaire. Chaque site (ou chaque formulaire) a le sien.",
    s2: "L'assistant à copier-coller",
    s2intro: "Fonctionne avec Astro, Next.js, Nuxt, Vue, Svelte, ou un simple",
    s3: "Utilisez-le",
    fields: [
      ["email field", "s'il est présent, l'expéditeur reçoit votre réponse automatique à votre image."],
      ["_lang", '"en" ou "fr" — sélectionne la langue de la réponse automatique.'],
      ["_gotcha", "champ honeypot caché. Les humains le laissent vide ; les bots le remplissent et sont écartés en silence."],
      ["files", "envoyez des données en base64 — elles sont téléversées vers le stockage et arrivent sous forme de liens de téléchargement."],
    ],
    s4: "Laissez votre IA le faire",
    s4intro1: "Vous utilisez Claude, Cursor ou Copilot ? Nous publions un fichier d'installation lisible par machine à",
    s4intro2: "— collez ce prompt et votre IA réalise toute l'intégration, correctement, du premier coup :",
    ccLabel: "Utilisateurs de Claude Code :",
    ccBody1: "déposez notre",
    ccSkill: "fichier skill",
    ccBody2: "et Claude câble seul les formulaires, honeypots et webhooks dans n'importe quel projet.",
    s5: "Webhooks (optionnel)",
    s5intro1: "Ajoutez une URL de webhook à un formulaire et chaque lead stocké est envoyé (POST) à votre endpoint sous forme de",
    s5intro2: "signé façon Stripe dans l'en-tête",
    s5intro3: "— vérifiez-le et rejetez les rejeux en cinq lignes :",
    whNote1: "La livraison est asynchrone avec une nouvelle tentative — un endpoint hors service ne peut jamais bloquer ni perdre un lead. Les endpoints doivent être en",
    serverTitle: "Ce qui se passe côté serveur",
    spamTitle: "Quatre barrières anti-spam.",
    spamBody: "Honeypot, vérification par preuve de travail, filtre NLP par mots-clés, blocage VPN/cloud par DNS inversé. Les tentatives bloquées sont journalisées, jamais délivrées.",
    emailTitle: "Deux e-mails.",
    emailBody: "Le propriétaire reçoit la notification du lead ; l'expéditeur reçoit une réponse automatique à l'image de votre client — logo, couleurs, nom d'expéditeur. La bascule SMTP de secours fait qu'un identifiant défaillant ne perd jamais un lead.",
    ctaTitle: "Prêt à arrêter de câbler l'e-mail dans chaque site ?",
    ctaBtn: "Commencer gratuitement",
    promptTitle: "prompt.txt — collez dans votre assistant IA",
  },
};

function SectionTitle({ n, children }: { n?: string; children: React.ReactNode }) {
  return (
    <h2 className="mt-14 flex items-center gap-3 text-2xl font-bold tracking-tight">
      {n && (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 font-mono text-xs font-bold text-white shadow-md shadow-blue-500/25">
          {n}
        </span>
      )}
      {children}
    </h2>
  );
}

function Code({ title, code }: { title: string; code: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-lg">
      <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-2.5">
        <Terminal className="h-3.5 w-3.5 text-slate-500" />
        <span className="text-xs text-slate-400">{title}</span>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto p-5 text-[13px] leading-relaxed text-slate-200"><code>{code}</code></pre>
    </div>
  );
}

export default async function DocsPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const { lang } = await searchParams;
  const locale = await resolveLocale(lang);
  const t = DOC[locale];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: "Inlet integration guide",
    inLanguage: locale,
    description: t.intro,
    author: { "@type": "Organization", name: "Inlet" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-white text-slate-900 font-sans">
        <ScrollProgress />
        <NavBar locale={locale} />

        {/* Aurora header — same identity as the landing */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[340px] overflow-hidden">
          <div className="aurora-a absolute -top-24 left-[28%] h-[300px] w-[300px] rounded-full bg-blue-500/15 blur-[110px]" />
          <div className="aurora-b absolute -top-16 right-[24%] h-[260px] w-[260px] rounded-full bg-cyan-400/12 blur-[110px]" />
        </div>

        <main className="relative mx-auto max-w-3xl px-6 py-16 lg:py-20">
          <p className="text-sm font-semibold text-blue-600">{t.eyebrow}</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
            {t.titleLead} <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text font-serif italic text-transparent">{t.titleAccent}</span>
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">{t.intro}</p>

          {/* The contract */}
          <SectionTitle n="1">{t.s1}</SectionTitle>
          <p className="mt-3 leading-7 text-slate-600">{t.s1intro}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
              <code className="text-sm font-semibold text-slate-900">FORM_API_URL</code>
              <p className="mt-1.5 text-sm text-slate-600">{t.apiUrlDesc}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
              <code className="text-sm font-semibold text-slate-900">FORM_ID</code>
              <p className="mt-1.5 text-sm text-slate-600">{t.formIdDesc}</p>
            </div>
          </div>

          {/* The helper */}
          <SectionTitle n="2">{t.s2}</SectionTitle>
          <p className="mt-3 mb-5 leading-7 text-slate-600">
            {t.s2intro} <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">&lt;script type=&quot;module&quot;&gt;</code>.
          </p>
          <Code title="form-service.js" code={HELPER} />

          <SectionTitle n="3">{t.s3}</SectionTitle>
          <div className="mt-5">
            <Code title="your-form-handler.js" code={USAGE} />
          </div>
          <ul className="mt-6 space-y-2.5 text-sm text-slate-700">
            {t.fields.map(([k, v]) => (
              <li key={k} className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span><code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-semibold">{k}</code> — {v}</span>
              </li>
            ))}
          </ul>

          {/* LLM prompt */}
          <SectionTitle n="4">{t.s4}</SectionTitle>
          <p className="mt-3 mb-5 leading-7 text-slate-600">
            {t.s4intro1}{" "}
            <a href="/llm-install.md" className="font-semibold text-blue-600 hover:underline">/llm-install.md</a>{" "}
            {t.s4intro2}
          </p>
          <Code title={t.promptTitle} code={LLM_PROMPT} />
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-violet-200 bg-violet-50/60 p-4">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
            <p className="text-sm leading-6 text-slate-700">
              <strong className="text-slate-900">{t.ccLabel}</strong> {t.ccBody1}{" "}
              <a href="/inlet-skill.md" className="font-semibold text-violet-700 hover:underline">{t.ccSkill}</a>{" "}
              <code className="rounded bg-white px-1.5 py-0.5 text-xs">.claude/skills/inlet/SKILL.md</code> {t.ccBody2}
            </p>
          </div>

          {/* Webhooks */}
          <SectionTitle n="5">{t.s5}</SectionTitle>
          <p className="mt-3 mb-5 leading-7 text-slate-600">
            {t.s5intro1}{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">submission.created</code>, {t.s5intro2}{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">X-Inlet-Signature</code>{" "}
            {t.s5intro3}
          </p>
          <Code title="verify-webhook.js" code={WEBHOOK_VERIFY} />
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
            <Webhook className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            <p className="text-sm leading-6 text-slate-600">
              {t.whNote1} <strong className="text-slate-900">https</strong>.
            </p>
          </div>

          {/* What the service does */}
          <h2 className="mt-14 text-2xl font-bold tracking-tight">{t.serverTitle}</h2>
          <div className="mt-5 grid gap-3">
            <div className="flex items-start gap-3.5 rounded-2xl border border-slate-200 p-5">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <p className="text-sm leading-6 text-slate-600">
                <strong className="text-slate-900">{t.spamTitle}</strong> {t.spamBody}
              </p>
            </div>
            <div className="flex items-start gap-3.5 rounded-2xl border border-slate-200 p-5">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
              <p className="text-sm leading-6 text-slate-600">
                <strong className="text-slate-900">{t.emailTitle}</strong> {t.emailBody}
              </p>
            </div>
          </div>

          <div className="relative mt-16 overflow-hidden rounded-3xl bg-slate-950 p-8 text-center text-white">
            <div aria-hidden className="pointer-events-none absolute -top-16 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-blue-500/25 blur-[90px]" />
            <h2 className="relative text-2xl font-bold">{t.ctaTitle}</h2>
            <div className="relative mt-5 flex justify-center">
              <Magnetic>
                <Link
                  href="/client/signup"
                  className="btn-shine btn-shine-soft inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-slate-900 transition-all duration-300 hover:bg-slate-100 hover:shadow-lg hover:shadow-white/10"
                >
                  {t.ctaBtn} <ArrowRight className="cta-arrow h-4 w-4" />
                </Link>
              </Magnetic>
            </div>
          </div>
        </main>

        <AiChat />
        <SiteFooter locale={locale} />
      </div>
    </>
  );
}
