'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

/**
 * App toast + confirm system — replaces native alert()/confirm(), which are
 * OS-grey dialogs and the least premium surface a product can show.
 *
 * Usage: mount <Toaster /> once per layout, then from anywhere client-side:
 *   toast.success('Saved.');  toast.error('Nope.');  toast.info('FYI.');
 *   if (await confirmDialog({ title, body, confirmLabel, danger })) { … }
 */

type ToastKind = 'success' | 'error' | 'info';
interface ToastMsg { id: number; kind: ToastKind; text: string; leaving?: boolean }

export interface ConfirmOptions {
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

type ToastListener = (t: ToastMsg) => void;
type ConfirmListener = (o: ConfirmOptions, resolve: (v: boolean) => void) => void;

let toastListener: ToastListener | null = null;
let confirmListener: ConfirmListener | null = null;
let nextId = 1;

export const toast = {
  success: (text: string) => toastListener?.({ id: nextId++, kind: 'success', text }),
  error: (text: string) => toastListener?.({ id: nextId++, kind: 'error', text }),
  info: (text: string) => toastListener?.({ id: nextId++, kind: 'info', text }),
};

export function confirmDialog(opts: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    // Fallback keeps flows working if a layout forgot to mount <Toaster/>.
    if (!confirmListener) return resolve(window.confirm(`${opts.title}\n\n${opts.body}`));
    confirmListener(opts, resolve);
  });
}

const KIND = {
  success: { icon: CheckCircle2, cls: 'text-emerald-400', bar: 'bg-emerald-400' },
  error:   { icon: AlertTriangle, cls: 'text-rose-400',   bar: 'bg-rose-400' },
  info:    { icon: Info,          cls: 'text-blue-400',   bar: 'bg-blue-400' },
} as const;

export function Toaster() {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [confirmState, setConfirmState] = useState<{ opts: ConfirmOptions; resolve: (v: boolean) => void } | null>(null);

  useEffect(() => {
    toastListener = (t) => {
      setToasts((list) => [...list.slice(-3), t]);
      // begin exit animation, then remove
      setTimeout(() => setToasts((list) => list.map((x) => (x.id === t.id ? { ...x, leaving: true } : x))), 3600);
      setTimeout(() => setToasts((list) => list.filter((x) => x.id !== t.id)), 4000);
    };
    confirmListener = (opts, resolve) => setConfirmState({ opts, resolve });
    return () => {
      toastListener = null;
      confirmListener = null;
    };
  }, []);

  const settle = (v: boolean) => {
    confirmState?.resolve(v);
    setConfirmState(null);
  };

  return (
    <>
      {/* -------- toasts -------- */}
      <div aria-live="polite" className="pointer-events-none fixed bottom-5 left-1/2 z-[80] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4">
        {toasts.map((t) => {
          const k = KIND[t.kind];
          return (
            <div
              key={t.id}
              className={`pointer-events-auto relative flex items-center gap-3 overflow-hidden rounded-xl border border-white/10 bg-slate-900/95 px-4 py-3 text-sm text-white shadow-2xl backdrop-blur transition-all duration-300 ${
                t.leaving ? 'translate-y-2 opacity-0' : 'fade-up'
              }`}
              role="status"
            >
              <span className={`absolute inset-y-0 left-0 w-1 ${k.bar}`} />
              <k.icon className={`h-4.5 w-4.5 shrink-0 ${k.cls}`} />
              <p className="flex-1 leading-snug">{t.text}</p>
              <button
                aria-label="Dismiss"
                onClick={() => setToasts((list) => list.filter((x) => x.id !== t.id))}
                className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* -------- confirm dialog -------- */}
      {confirmState && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center px-4" role="alertdialog" aria-modal="true" aria-label={confirmState.opts.title}>
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => settle(false)} />
          <div className="fade-up relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">{confirmState.opts.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{confirmState.opts.body}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => settle(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                {confirmState.opts.cancelLabel || 'Cancel'}
              </button>
              <button
                onClick={() => settle(true)}
                autoFocus
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${
                  confirmState.opts.danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                {confirmState.opts.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
