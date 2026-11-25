'use client';

import { useEffect, useState } from 'react';
import { CalendarClock, DatabaseBackup, MailCheck, ShieldAlert } from 'lucide-react';
import { getOperationsStatus, type OperationsStatus } from '@/lib/actions';
import { useLocale } from '@/lib/useLocale';

const COPY = {
  en: {
    title: 'Scheduled jobs',
    sub: 'What ran, when, and what it touched. A job that has not written here in over a day is not running.',
    noSecret: 'CRON_SECRET is not set: no scheduled job can run.',
    redeliver: 'Notification sweep', retention: 'Retention', backup: 'Backup',
    backupFile: 'Newest file: {name} ({size} kB)', backupNone: 'No backup is stored.', backupRule: 'Accounts, clients, forms and leads, 14 days kept. Retention deletes nothing unless this job succeeded in the last 26 hours.',
    never: 'never ran', late: 'no run for over a day', failed: 'last run failed',
    pending: '{n} lead(s) still waiting for their notification', pendingNone: 'every lead of the last 30 days was notified',
    sweep: 'sent {s}, failed {f}, paused {p}',
    modeOff: 'Off. Nothing is announced, nothing is deleted.',
    modeReport: 'Report only. You are told what arming would do; no developer is e-mailed, nothing is deleted.',
    modeApply: 'Armed. Developers are e-mailed first; a lead goes only on the date its notice gave.',
    retApply: 'deleted {d}, notices {n}, last calls {r}, errors {e}',
    retReport: 'arming would notify {n} account(s), errors {e}',
    notices: 'Notices sent', noNotices: 'No deletion notice has been sent.',
    colDev: 'Developer', colWindow: 'Window', colLeads: 'Leads announced', colOverdue: 'Already past', colSent: 'Sent', colFrom: 'Deletes from', colDeleted: 'Deleted so far',
    days: '{n} d', loadError: 'Could not read the job diary.',
  },
  fr: {
    title: 'Tâches planifiées',
    sub: 'Ce qui a tourné, quand, et ce que cela a touché. Une tâche qui n’a rien écrit ici depuis plus d’un jour ne tourne pas.',
    noSecret: 'CRON_SECRET n’est pas défini : aucune tâche planifiée ne peut tourner.',
    redeliver: 'Balayage des notifications', retention: 'Rétention', backup: 'Sauvegarde',
    backupFile: 'Dernier fichier : {name} ({size} ko)', backupNone: 'Aucune sauvegarde enregistrée.', backupRule: 'Comptes, clients, formulaires et leads, 14 jours conservés. La rétention ne supprime rien si cette tâche n’a pas réussi dans les 26 dernières heures.',
    never: 'jamais exécutée', late: 'aucune exécution depuis plus d’un jour', failed: 'dernière exécution en échec',
    pending: '{n} lead(s) attendent encore leur notification', pendingNone: 'tous les leads des 30 derniers jours ont été notifiés',
    sweep: 'envoyés {s}, échecs {f}, en pause {p}',
    modeOff: 'Désactivée. Rien n’est annoncé, rien n’est supprimé.',
    modeReport: 'Rapport seul. Vous voyez ce que l’activation ferait ; aucun développeur ne reçoit d’e-mail, rien n’est supprimé.',
    modeApply: 'Activée. Les développeurs sont prévenus par e-mail d’abord ; un lead ne part qu’à la date de son avis.',
    retApply: 'supprimés {d}, avis {n}, derniers rappels {r}, erreurs {e}',
    retReport: 'l’activation préviendrait {n} compte(s), erreurs {e}',
    notices: 'Avis envoyés', noNotices: 'Aucun avis de suppression n’a été envoyé.',
    colDev: 'Développeur', colWindow: 'Durée', colLeads: 'Leads annoncés', colOverdue: 'Déjà dépassés', colSent: 'Envoyé', colFrom: 'Supprime à partir du', colDeleted: 'Supprimés à ce jour',
    days: '{n} j', loadError: 'Impossible de lire le journal des tâches.',
  },
} as const;

const num = (v: unknown) => (typeof v === 'number' ? v : 0);

export default function JobsPanel() {
  const locale = useLocale();
  const c = COPY[locale];
  const [data, setData] = useState<OperationsStatus | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    getOperationsStatus()
      .then((r) => { if (!alive) return; if (r.success) setData(r.data); else setError(true); })
      .catch(() => alive && setError(true));
    return () => { alive = false; };
  }, []);

  const when = (iso: string) =>
    new Date(iso).toLocaleString(locale === 'en' ? 'en-GB' : 'fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) + ' UTC';
  const dayOf = (iso: string) => new Date(iso).toLocaleDateString(locale === 'en' ? 'en-GB' : 'fr-FR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  const fill = (s: string, v: Record<string, unknown>) => s.replace(/\{(\w)\}/g, (_, k: string) => String(v[k] ?? 0));

  if (error) return <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">{c.loadError}</p>;
  if (!data) return null;

  const state = (job: OperationsStatus['jobs']['redeliver']) =>
    !job ? { text: c.never, bad: true } : !job.ok ? { text: `${when(job.at)} · ${c.failed}`, bad: true } : job.stale ? { text: `${when(job.at)} · ${c.late}`, bad: true } : { text: when(job.at), bad: false };

  const red = state(data.jobs.redeliver);
  const ret = state(data.jobs.retention);
  const bak = state(data.jobs.backup);
  const rs = data.jobs.retention?.summary ?? {};
  const ds = data.jobs.redeliver?.summary ?? {};
  const modeLine = data.retentionMode === 'apply' ? c.modeApply : data.retentionMode === 'report' ? c.modeReport : c.modeOff;

  return (
    <section aria-labelledby="jobs-title" className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h2 id="jobs-title" className="text-base font-bold text-slate-900 dark:text-white">{c.title}</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{c.sub}</p>
      {!data.cronSecretSet && (
        <p role="alert" className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden /> {c.noSecret}
        </p>
      )}

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white"><DatabaseBackup className="h-4 w-4 text-slate-400" aria-hidden /> {c.backup}</p>
          <p className={`mt-1 text-sm ${bak.bad ? 'font-medium text-amber-700 dark:text-amber-400' : 'text-slate-600 dark:text-slate-300'}`}>{bak.text}</p>
          <p className="mt-1 break-all text-xs text-slate-500 dark:text-slate-400">
            {data.newestBackup
              ? c.backupFile.replace('{name}', data.newestBackup.name.replace(/^daily\//, '')).replace('{size}', data.newestBackup.bytes === null ? '?' : (data.newestBackup.bytes / 1024).toFixed(1))
              : c.backupNone}
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{c.backupRule}</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white"><MailCheck className="h-4 w-4 text-slate-400" aria-hidden /> {c.redeliver}</p>
          <p className={`mt-1 text-sm ${red.bad ? 'font-medium text-amber-700 dark:text-amber-400' : 'text-slate-600 dark:text-slate-300'}`}>{red.text}</p>
          {data.jobs.redeliver && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{fill(c.sweep, { s: num(ds.sent), f: num(ds.failed), p: num(ds.paused) })}</p>}
          <p className={`mt-2 text-xs ${data.pendingNotifications > 0 ? 'font-semibold text-amber-700 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
            {data.pendingNotifications > 0 ? c.pending.replace('{n}', String(data.pendingNotifications)) : c.pendingNone}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white"><CalendarClock className="h-4 w-4 text-slate-400" aria-hidden /> {c.retention}</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{modeLine}</p>
          <p className={`mt-1 text-xs ${ret.bad && data.retentionMode !== 'off' ? 'font-medium text-amber-700 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>{ret.text}</p>
          {data.jobs.retention && data.jobs.retention.mode === 'apply' && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{fill(c.retApply, { d: num(rs.leadsDeleted), n: num(rs.noticesSent), r: num(rs.remindersSent), e: num(rs.errors) })}</p>
          )}
          {data.jobs.retention && data.jobs.retention.mode === 'report' && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{fill(c.retReport, { n: num(rs.wouldNotify), e: num(rs.errors) })}</p>
          )}
        </div>
      </div>

      <h3 className="mt-5 text-sm font-semibold text-slate-900 dark:text-white">{c.notices}</h3>
      {data.notices.length === 0 ? (
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{c.noNotices}</p>
      ) : (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <tr>
                {[c.colDev, c.colWindow, c.colLeads, c.colOverdue, c.colSent, c.colFrom, c.colDeleted].map((h) => <th key={h} scope="col" className="py-2 pr-4 font-semibold">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.notices.map((n, i) => (
                <tr key={i} className="text-slate-700 dark:text-slate-300">
                  <td className="py-2 pr-4 font-medium text-slate-900 dark:text-white">{n.developer}</td>
                  <td className="py-2 pr-4">{c.days.replace('{n}', String(n.windowDays))}</td>
                  <td className="py-2 pr-4">{n.leadCount}</td>
                  <td className="py-2 pr-4">{n.overdueCount}</td>
                  <td className="py-2 pr-4">{dayOf(n.sentAt)}</td>
                  <td className="py-2 pr-4">{dayOf(n.deleteAfter)}</td>
                  <td className="py-2 pr-4">{n.deletedCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
