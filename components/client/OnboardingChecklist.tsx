'use client';

import { useState } from 'react';
import { Check, Circle, FileText, Code2, Inbox, ArrowRight, Copy, Terminal } from 'lucide-react';
import NewFormButton from './NewFormButton';

type Form = { id: string; name: string };
type OnbDict = import('@/lib/appDict').AppDict['dashboard']['onboarding'];
type NfDict = import('@/lib/appDict').AppDict['dashboard']['nf'];

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-950/60 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <code className="flex-1 truncate text-xs font-semibold text-slate-800 dark:text-slate-200">{value}</code>
        <button
          onClick={async () => { try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {} }}
          aria-label={`Copy ${label}`}
          className="shrink-0 rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-1.5 text-slate-500 hover:text-slate-900 transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}

function CopyBlock({ code, copyLabel, copiedLabel }: { code: string; copyLabel: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
      <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-2.5">
        <Terminal className="h-3.5 w-3.5 text-slate-500" />
        <span className="text-xs text-slate-400">contact-form.html</span>
        <button
          onClick={async () => { try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch {} }}
          className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-300 hover:border-slate-500 hover:text-white transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? copiedLabel : copyLabel}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[12px] leading-relaxed text-slate-200"><code>{code}</code></pre>
    </div>
  );
}

function StepBadge({ state, n }: { state: 'done' | 'active' | 'todo'; n: number }) {
  if (state === 'done')
    return <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white"><Check className="h-4 w-4" /></span>;
  if (state === 'active')
    return <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">{n}</span>;
  return <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-sm font-bold text-slate-300">{n}</span>;
}

export default function OnboardingChecklist({ formsCount, forms, t, nf }: { formsCount: number; forms: Form[]; t: OnbDict; nf: NfDict }) {
  const [selected, setSelected] = useState<string>(forms[0]?.id ?? '');
  const apiUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const formId = selected || 'YOUR_FORM_ID';

  const hasForm = formsCount > 0;
  const s1: 'done' | 'active' | 'todo' = hasForm ? 'done' : 'active';
  const s2: 'done' | 'active' | 'todo' = hasForm ? 'active' : 'todo';
  const s3: 'done' | 'active' | 'todo' = 'todo';

  const snippet = `<form action="${apiUrl}/api/submit/${formId}" method="POST">
  <input name="name" placeholder="Name" required />
  <input name="email" type="email" placeholder="Email" required />
  <textarea name="message" placeholder="Message" required></textarea>

  <!-- honeypot: keep it, keep it empty -->
  <input name="_gotcha" tabindex="-1" autocomplete="off"
         style="position:absolute;left:-9999px" aria-hidden="true" />

  <button type="submit">Send</button>
</form>`;

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-4">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          <Inbox className="h-3.5 w-3.5" /> {t.kicker}
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t.title}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">{t.subtitle}</p>
      </div>

      {/* Step 1 */}
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <StepBadge state={s1} n={1} />
          <div className="mt-1 w-px flex-1 bg-slate-100" />
        </div>
        <div className="flex-1 pb-6">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-400" />
            <h2 className="font-bold text-slate-900 dark:text-white">{t.s1Title}</h2>
            {s1 === 'done' && <span className="text-xs font-semibold text-emerald-600">{t.s1Done.replace('{n}', String(formsCount)).replace('{s}', formsCount > 1 ? 's' : '')}</span>}
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.s1Body}</p>
          <div className="mt-3">
            <NewFormButton prominent={!hasForm} label={nf.createBtn} m={nf} />
          </div>
        </div>
      </div>

      {/* Step 2 */}
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <StepBadge state={s2} n={2} />
          <div className="mt-1 w-px flex-1 bg-slate-100" />
        </div>
        <div className={`flex-1 pb-6 ${s2 === 'todo' ? 'opacity-50' : ''}`}>
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-slate-400" />
            <h2 className="font-bold text-slate-900 dark:text-white">{t.s2Title}</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.s2Body}</p>

          {hasForm && (
            <div className="mt-4 space-y-3">
              {forms.length > 1 && (
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                >
                  {forms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <CopyField label="FORM_API_URL" value={apiUrl} />
                <CopyField label="FORM_ID" value={formId} />
              </div>
              <CopyBlock code={snippet} copyLabel={t.copy} copiedLabel={t.copied} />
              <p className="text-xs text-slate-500">
                {t.jsAlt}{' '}
                <a href="/docs" target="_blank" className="font-semibold text-blue-600 hover:underline">{t.readDocs}</a> — {t.orPointAiAt}{' '}
                <a href="/llm-install.md" target="_blank" className="font-semibold text-blue-600 hover:underline">/llm-install.md</a>.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Step 3 */}
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <StepBadge state={s3} n={3} />
        </div>
        <div className={`flex-1 ${s3 === 'todo' && !hasForm ? 'opacity-50' : ''}`}>
          <div className="flex items-center gap-2">
            <Inbox className="h-4 w-4 text-slate-400" />
            <h2 className="font-bold text-slate-900 dark:text-white">{t.s3Title}</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t.s3Body}
          </p>
          {hasForm && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-500 dark:text-slate-400">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />
              </span>
              {t.waiting}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-950/60 px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
        <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
        {t.footer}
      </div>
    </div>
  );
}
