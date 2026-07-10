import type { Metadata } from "next";
import Link from "next/link";
import { NavBar, SiteFooter } from "@/components/marketing/NavBar";
import { Check, Terminal, ShieldCheck, Mail } from "lucide-react";
import CopyButton from "@/components/CopyButton";

export const metadata: Metadata = {
  title: "Documentation — integrate in minutes",
  description:
    "How to integrate King E Forms into any website: the two-value contract (FORM_API_URL + FORM_ID), the proof-of-work challenge, the submit endpoint, field conventions, and a copy-paste helper for Astro, Next.js, Vue or plain HTML.",
  alternates: { canonical: "/docs" },
};

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

const LLM_PROMPT = `Integrate King E Forms into this project.
Contract: set PUBLIC_FORM_API_URL and PUBLIC_FORM_ID env vars.
Flow: GET {API_URL}/api/challenge -> solve proof-of-work (find nonce where
SHA-256("challenge:nonce") starts with N zeros, N = difficulty) ->
POST {API_URL}/api/submit/{FORM_ID} with the form fields plus _lang, an empty
_gotcha honeypot, pow_challenge, pow_timestamp, pow_nonce.
The service handles owner notification and the branded auto-reply.
Do NOT add SMTP or any email library — that is the whole point.`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "King E Forms integration guide",
  description:
    "Integrate a form backend with no SMTP: two env values, one copy-paste helper, proof-of-work spam protection built in.",
  author: { "@type": "Organization", name: "King E Forms" },
};

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

export default function DocsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-white text-slate-900 font-sans">
        <NavBar />

        <main className="mx-auto max-w-3xl px-6 py-16 lg:py-20">
          <p className="text-sm font-semibold text-blue-600">Documentation</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">Integrate in minutes</h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Your website never touches SMTP. It holds two values and calls two endpoints — the service
            does delivery, spam filtering, and the branded auto-reply.
          </p>

          {/* The contract */}
          <h2 className="mt-14 text-2xl font-bold tracking-tight">1 · The two-value contract</h2>
          <p className="mt-3 leading-7 text-slate-600">
            Create a form in your dashboard and copy its ID. Give your site exactly two values:
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-5">
              <code className="text-sm font-semibold text-slate-900">FORM_API_URL</code>
              <p className="mt-1.5 text-sm text-slate-600">The service origin — where challenges and submissions go.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5">
              <code className="text-sm font-semibold text-slate-900">FORM_ID</code>
              <p className="mt-1.5 text-sm text-slate-600">One form&apos;s UUID. Each site (or each form) gets its own.</p>
            </div>
          </div>

          {/* The helper */}
          <h2 className="mt-14 text-2xl font-bold tracking-tight">2 · The copy-paste helper</h2>
          <p className="mt-3 mb-5 leading-7 text-slate-600">
            Works in Astro, Next.js, Nuxt, Vue, Svelte, or a plain <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">&lt;script type=&quot;module&quot;&gt;</code>.
          </p>
          <Code title="form-service.js" code={HELPER} />

          <h2 className="mt-14 text-2xl font-bold tracking-tight">3 · Use it</h2>
          <div className="mt-5">
            <Code title="your-form-handler.js" code={USAGE} />
          </div>
          <ul className="mt-6 space-y-2.5 text-sm text-slate-700">
            {[
              ["email field", "if present, the submitter receives your branded auto-reply."],
              ["_lang", '"en" or "fr" — selects the auto-reply language.'],
              ["_gotcha", "hidden honeypot input. Humans leave it empty; bots fill it and get silently dropped."],
              ["files", "send base64 payloads — they are uploaded to storage and arrive as download links."],
            ].map(([k, v]) => (
              <li key={k} className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span><code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-semibold">{k}</code> — {v}</span>
              </li>
            ))}
          </ul>

          {/* LLM prompt */}
          <h2 className="mt-14 text-2xl font-bold tracking-tight">4 · Let your AI do it</h2>
          <p className="mt-3 mb-5 leading-7 text-slate-600">
            Using Copilot, Claude, or Cursor? Paste this prompt and it will wire your form correctly:
          </p>
          <Code title="prompt.txt — paste into your AI assistant" code={LLM_PROMPT} />

          {/* What the service does */}
          <h2 className="mt-14 text-2xl font-bold tracking-tight">What happens server-side</h2>
          <div className="mt-5 grid gap-3">
            <div className="flex items-start gap-3.5 rounded-2xl border border-slate-200 p-5">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <p className="text-sm leading-6 text-slate-600">
                <strong className="text-slate-900">Four spam gates.</strong> Honeypot, proof-of-work verification,
                NLP keyword filter, reverse-DNS VPN/cloud blocking. Blocked attempts are logged, never delivered.
              </p>
            </div>
            <div className="flex items-start gap-3.5 rounded-2xl border border-slate-200 p-5">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
              <p className="text-sm leading-6 text-slate-600">
                <strong className="text-slate-900">Two emails.</strong> The owner gets the lead notification;
                the submitter gets an auto-reply in your client&apos;s branding — logo, colors, sender name.
                SMTP fallback rotation means a failing credential never loses a lead.
              </p>
            </div>
          </div>

          <div className="mt-16 rounded-3xl bg-slate-950 p-8 text-center text-white">
            <h2 className="text-2xl font-bold">Ready to stop wiring email into every site?</h2>
            <Link
              href="/client/signup"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-medium text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Start free
            </Link>
          </div>
        </main>

        <SiteFooter />
      </div>
    </>
  );
}
