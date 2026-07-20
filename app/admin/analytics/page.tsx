'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye, Users, Activity, Globe, Monitor, ExternalLink, FileText, RefreshCw } from 'lucide-react';
import { getTrafficStats } from '@/lib/actions';
import { useLocale } from '@/lib/useLocale';
import { getAppDict } from '@/lib/appDict';

type Bar = { name: string; count: number };
type Stats = {
  available: boolean;
  totals: { all: number; today: number; week: number };
  unique: { today: number; week: number };
  dailyTrends: { date: string; views: number; visitors: number }[];
  topPaths: Bar[];
  topReferrers: Bar[];
  devices: Bar[];
  countries: Bar[];
  recent: { path: string; referrer: string | null; device: string; browser: string; country: string | null; created_at: string }[];
};

function Kpi({ icon: Icon, label, value, hint, tone }: { icon: any; label: string; value: number; hint: string; tone: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5">
      <div className={`absolute -right-3 -top-3 rounded-full ${tone} p-6 opacity-10`}><Icon className="h-8 w-8" /></div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{value.toLocaleString('en-US')}</p>
      <p className="mt-1 text-xs font-medium text-slate-400">{hint}</p>
    </div>
  );
}

function BarList({ title, icon: Icon, rows, hrefs, noDataLabel }: { title: string; icon: any; rows: Bar[]; hrefs?: boolean; noDataLabel: string }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5">
      <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white"><Icon className="h-4 w-4 text-slate-400" /> {title}</div>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-400">{noDataLabel}</p>
      ) : (
        <div className="space-y-2.5">
          {rows.map((r) => (
            <div key={r.name}>
              <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                <span className="truncate font-medium text-slate-700 dark:text-slate-300">{hrefs && r.name.startsWith('/') ? <span className="font-mono">{r.name}</span> : r.name}</span>
                <span className="shrink-0 font-bold text-slate-900 dark:text-white tabular-nums">{r.count.toLocaleString('en-US')}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-blue-500" style={{ width: `${(r.count / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const t = getAppDict(useLocale()).admin.analytics;
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const data = (await getTrafficStats()) as Stats;
      setStats(data);
    } catch (e) {
      console.error('analytics load error', e);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
    const id = setInterval(load, 30000); // near-live refresh
    return () => clearInterval(id);
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
      </div>
    );
  }

  if (!stats?.available) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{t.title}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t.subtitleDisabled}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10 p-6 text-sm text-amber-900">
          {t.notEnabledA} <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs">migrations/migration_v11_analytics.sql</code> {t.notEnabledB}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{t.title}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t.subtitleEnabled}</p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-slate-300 transition-colors">
          <RefreshCw className="h-3.5 w-3.5" /> {t.refresh}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={Eye} label={t.kpiViewsToday} value={stats.totals.today} hint={t.kpiViewsTodayHint} tone="bg-blue-500" />
        <Kpi icon={Users} label={t.kpiVisitorsToday} value={stats.unique.today} hint={t.kpiVisitorsTodayHint} tone="bg-emerald-500" />
        <Kpi icon={Activity} label={t.kpiViews7d} value={stats.totals.week} hint={t.kpiViews7dHint.replace('{n}', String(stats.unique.week))} tone="bg-purple-500" />
        <Kpi icon={Eye} label={t.kpiViewsAllTime} value={stats.totals.all} hint={t.kpiViewsAllTimeHint} tone="bg-slate-700" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white"><Activity className="h-4 w-4 text-blue-500" /> {t.last30Days}</div>
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.dailyTrends}>
              <defs>
                <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(d) => String(d).slice(5)} minTickGap={24} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Area type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} fill="url(#v)" name={t.chartViews} />
              <Area type="monotone" dataKey="visitors" stroke="#10b981" strokeWidth={2} fill="transparent" name={t.chartVisitors} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BarList title={t.topPages} icon={FileText} rows={stats.topPaths} hrefs noDataLabel={t.noData} />
        <BarList title={t.topReferrers} icon={ExternalLink} rows={stats.topReferrers} noDataLabel={t.noData} />
        <BarList title={t.devices} icon={Monitor} rows={stats.devices} noDataLabel={t.noData} />
        <BarList title={t.countries} icon={Globe} rows={stats.countries} noDataLabel={t.noData} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 dark:border-slate-800 px-5 py-4 text-sm font-bold text-slate-900 dark:text-white">{t.recentVisitors}</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold uppercase text-slate-400">
              <tr>
                <th className="px-5 py-3">{t.colWhen}</th>
                <th className="px-5 py-3">{t.colPage}</th>
                <th className="px-5 py-3">{t.colReferrer}</th>
                <th className="px-5 py-3">{t.colDevice}</th>
                <th className="px-5 py-3">{t.colCountry}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {stats.recent.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">{t.noVisits}</td></tr>
              ) : stats.recent.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-5 py-3 text-slate-500">{new Date(r.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-800 dark:text-slate-200">{r.path}</td>
                  <td className="max-w-[220px] truncate px-5 py-3 text-slate-500">{r.referrer || t.direct}</td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{r.device} · {r.browser}</td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{r.country || t.dash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
