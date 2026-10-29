'use client';

import { useMemo, useState } from 'react';
import { Check, Copy, Terminal, ShieldCheck } from 'lucide-react';
import { SNIPPET_TARGETS, buildSnippet, helperSnippet, type SnippetInput, type SnippetTarget } from '@/lib/snippets';

/**
 * Framework tabs for the integration code. One source (lib/snippets) feeds
 * the dashboard, the docs and the MCP server, so what a developer copies here
 * is exactly what an agent would get from `get_embed`.
 */

type Labels = { copy: string; copied: string; helperTab: string; filesHint: string; noEmail: string };

function CodeBlock({ title, code, copyLabel, copiedLabel }: { title: string; code: string; copyLabel: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
      <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-2.5">
        <Terminal className="h-3.5 w-3.5 text-slate-500" />
        <span className="truncate text-xs text-slate-400">{title}</span>
        <button
          type="button"
          onClick={async () => { try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch {} }}
          className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? copiedLabel : copyLabel}
        </button>
      </div>
      <pre className="max-h-[420px] overflow-auto p-4 text-[12px] leading-relaxed text-slate-200"><code>{code}</code></pre>
    </div>
  );
}

export default function SnippetTabs({ input, labels, initial = 'html' }: { input: SnippetInput; labels: Labels; initial?: SnippetTarget }) {
  const [target, setTarget] = useState<SnippetTarget>(initial);
  const meta = SNIPPET_TARGETS.find((t) => t.id === target) ?? SNIPPET_TARGETS[0];
  const code = useMemo(() => buildSnippet(target, input), [target, input]);
  const helper = useMemo(() => helperSnippet(input), [input]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5" role="tablist">
        {SNIPPET_TARGETS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={t.id === target}
            onClick={() => setTarget(t.id)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
              t.id === target
                ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-950'
                : 'border-slate-200 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {meta.needsHelper && (
        <>
          <p className="text-xs text-slate-500 dark:text-slate-400">{labels.filesHint}</p>
          <CodeBlock title={labels.helperTab} code={helper} copyLabel={labels.copy} copiedLabel={labels.copied} />
        </>
      )}
      <CodeBlock title={meta.file} code={code} copyLabel={labels.copy} copiedLabel={labels.copied} />

      <p className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
        {labels.noEmail}
      </p>
    </div>
  );
}
