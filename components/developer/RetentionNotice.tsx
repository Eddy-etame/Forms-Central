import Link from 'next/link';
import { CalendarClock } from 'lucide-react';
import ExportButton from '@/components/ExportButton';
import type { AppDict } from '@/lib/appDict';
import type { UpcomingDeletions } from '@/lib/retention';

type RetentionDict = AppDict['dashboard']['retention'];

/**
 * The deletions already announced by e-mail and still ahead, repeated where
 * the developer works — with the two ways to keep the leads. Renders nothing
 * when nothing is scheduled.
 */
export default function RetentionNotice({ upcoming, r, locale }: { upcoming: UpcomingDeletions | null; r: RetentionDict; locale: 'fr' | 'en' }) {
  if (!upcoming) return null;
  const date = new Date(upcoming.firstAt).toLocaleDateString(locale === 'en' ? 'en-GB' : 'fr-FR', { day: 'numeric', month: 'long', timeZone: 'UTC' });
  const windowWords = upcoming.windowDays === 365 ? r.year : r.days.replace('{n}', String(upcoming.windowDays));
  const n = upcoming.firstCount;
  const title = upcoming.today
    ? (n === 1 ? r.todayOne : r.today.replace('{n}', String(n)))
    : (n === 1 ? r.bannerOne : r.banner.replace('{n}', String(n))).replace('{date}', date);
  const hint = (upcoming.total > n ? r.hint : r.hintAll)
    .replace('{plan}', upcoming.planName)
    .replace('{window}', windowWords)
    .replace('{total}', String(upcoming.total));

  return (
    <div
      role="status"
      className="flex flex-col gap-3 rounded-2xl border border-slate-300 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-600 dark:bg-slate-900"
    >
      <div className="flex items-start gap-3">
        <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden />
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
          <p className="mt-0.5 max-w-2xl text-xs leading-5 text-slate-600 dark:text-slate-400">{hint}</p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-start gap-2">
        <ExportButton
          href="/api/developer/leads/export"
          label={r.exportAll}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        />
        <Link
          href="/developer/choose-plan"
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-500"
        >
          {r.plans}
        </Link>
      </div>
    </div>
  );
}
