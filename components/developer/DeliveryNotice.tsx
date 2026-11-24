'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MailWarning, Send } from 'lucide-react';
import { toast } from '@/components/ui/Toaster';
import type { AppDict } from '@/lib/appDict';

export type DeliveryDict = AppDict['dashboard']['delivery'];

/** Sends the notifications that never left (all pending ones, or the given leads) and reports what really happened. */
export function useRedeliver(d: DeliveryDict) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function send(ids?: string[]) {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch('/api/developer/leads/redeliver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ids ? { ids } : {}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) toast.error(data.error || d.failed);
      else if (data.sent > 0 && data.failed === 0) toast.success(data.sent === 1 ? d.sentOne : d.sent.replace('{n}', String(data.sent)));
      else if (data.sent > 0) toast.info(d.partial.replace('{n}', String(data.sent)).replace('{f}', String(data.failed)));
      else if (data.paused > 0) toast.error(d.paused);
      else if (data.failed > 0) toast.error(d.failed);
      else toast.info(d.nothing);
      router.refresh();
    } catch {
      toast.error(d.failed);
    } finally {
      setBusy(false);
    }
  }

  return { busy, send };
}

/** Leads that were stored but whose notification e-mail did not go out. Renders nothing when there are none. */
export default function DeliveryNotice({ count, d }: { count: number; d: DeliveryDict }) {
  const { busy, send } = useRedeliver(d);
  if (count <= 0) return null;
  return (
    <div
      role="status"
      className="flex flex-col gap-3 rounded-2xl border border-amber-300/80 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-amber-400/30 dark:bg-amber-500/10"
    >
      <div className="flex items-start gap-3">
        <MailWarning className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
        <div>
          <p className="text-sm font-semibold text-amber-950 dark:text-amber-100">
            {(count === 1 ? d.bannerOne : d.banner).replace('{n}', String(count))}
          </p>
          <p className="mt-0.5 text-xs leading-5 text-amber-900/90 dark:text-amber-200/80">{d.bannerHint}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => send()}
        disabled={busy}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-700 disabled:opacity-60 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400"
      >
        <Send className="h-4 w-4" aria-hidden /> {busy ? d.sending : count === 1 ? d.sendNowOne : d.sendNow}
      </button>
    </div>
  );
}

export function PendingChip({ d }: { d: DeliveryDict }) {
  return (
    <span title={d.chipHint} className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
      {d.chip}
    </span>
  );
}

/** The line shown inside a lead's detail view when its notification is still owed. */
export function PendingLine({ leadId, d }: { leadId: string; d: DeliveryDict }) {
  const { busy, send } = useRedeliver(d);
  return (
    <div className="mb-4 flex flex-col gap-2 rounded-xl border border-amber-300/80 bg-amber-50 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between dark:border-amber-400/30 dark:bg-amber-500/10">
      <span className="flex items-center gap-2 font-medium text-amber-950 dark:text-amber-100">
        <MailWarning className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden /> {d.modalLine}
      </span>
      <button
        type="button"
        onClick={() => send([leadId])}
        disabled={busy}
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-amber-400 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 transition-colors hover:bg-amber-100 disabled:opacity-60 dark:border-amber-400/40 dark:bg-transparent dark:text-amber-200 dark:hover:bg-amber-500/10"
      >
        <Send className="h-3.5 w-3.5" aria-hidden /> {busy ? d.sending : d.modalSend}
      </button>
    </div>
  );
}
