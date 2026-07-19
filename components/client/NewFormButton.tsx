'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Check, Copy, ArrowRight, Sparkles } from 'lucide-react';

/**
 * Self-serve form creation: name it, get FORM_ID + API URL + a working
 * snippet immediately. The "aha" moment of the product.
 */

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-950/60 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <code className="flex-1 truncate text-xs font-semibold text-slate-800 dark:text-slate-200">{value}</code>
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch {}
          }}
          aria-label={`Copy ${label}`}
          className="shrink-0 rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-1.5 text-slate-500 hover:text-slate-900 transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}

export default function NewFormButton({ prominent = false }: { prominent?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [paywall, setPaywall] = useState(false);
  const [created, setCreated] = useState<{ id: string; name: string } | null>(null);

  const apiUrl = typeof window !== 'undefined' ? window.location.origin : '';

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/client/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCreated(data.form);
        router.refresh(); // sidebar + stats pick up the new form
      } else if (res.status === 402) {
        setPaywall(true);
        setError(data.error);
      } else {
        setError(data.error || 'Could not create the form.');
      }
    } catch {
      setError('Could not reach the server.');
    } finally {
      setBusy(false);
    }
  }

  function close() {
    setOpen(false);
    setTimeout(() => {
      setName('');
      setError('');
      setPaywall(false);
      setCreated(null);
    }, 250);
  }

  return (
    <>
      {prominent ? (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> Create your first form
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> New form
        </button>
      )}

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-6 py-4">
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {created ? 'Your form is live' : 'Create a form'}
                </h3>
                <button onClick={close} aria-label="Close" className="rounded-full p-2 hover:bg-slate-200 transition-colors">
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>

              {!created ? (
                <form onSubmit={create} className="space-y-4 p-6">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Name it after the website or purpose — you&apos;ll get its ID and a
                    working snippet right away.
                  </p>
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Portfolio contact form"
                    maxLength={60}
                    disabled={busy}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                  {error && (
                    <div role="alert" className="rounded-lg border border-red-100 bg-red-50 p-3 text-xs font-medium text-red-600">
                      {error}
                      {paywall && (
                        <a href="/pricing" className="mt-2 flex items-center gap-1 font-semibold text-slate-900 dark:text-white hover:underline">
                          See Pro plans <ArrowRight className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={busy || !name.trim()}
                    className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    {busy ? 'Creating…' : 'Create form'}
                  </button>
                </form>
              ) : (
                <div className="space-y-4 p-6">
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-sm text-emerald-900">
                      <strong>{created.name}</strong> is ready to receive submissions.
                      Wire it with these two values:
                    </p>
                  </div>
                  <CopyRow label="FORM_API_URL" value={apiUrl} />
                  <CopyRow label="FORM_ID" value={created.id} />
                  <a
                    href="/docs"
                    target="_blank"
                    className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300 transition-colors"
                  >
                    Open the integration guide <ArrowRight className="h-4 w-4" />
                  </a>
                  <button
                    onClick={close}
                    className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
                  >
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
