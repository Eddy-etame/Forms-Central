'use client';

import { useState, useEffect, useCallback } from 'react';
import { getEmailHealth } from '@/lib/actions';
import BlurFade from '@/components/magicui/blur-fade';
import { Mail, CheckCircle2, AlertTriangle, XCircle, PauseCircle, RefreshCw, ServerCrash, Activity } from 'lucide-react';

interface AccountHealth {
  label: string;
  user: string;
  from: string;
  disabled: boolean;
  status: 'disabled' | 'failing' | 'degraded' | 'healthy';
  failures24h: number;
  lastFailureAt: string | null;
  lastError: string | null;
}

interface HealthData {
  accounts: AccountHealth[];
  totalConfigured: number;
  activeCount: number;
  outages24h: number;
  lastOutageAt: string | null;
}

const STATUS = {
  healthy:  { label: 'Healthy',   ring: 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10', dot: 'bg-emerald-500', text: 'text-emerald-700', Icon: CheckCircle2 },
  degraded: { label: 'Recovering', ring: 'border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10',    dot: 'bg-amber-500',   text: 'text-amber-700',   Icon: Activity },
  failing:  { label: 'Failing',    ring: 'border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10',        dot: 'bg-red-500',     text: 'text-red-700',     Icon: AlertTriangle },
  disabled: { label: 'Disabled',   ring: 'border-slate-200 bg-slate-50',    dot: 'bg-slate-400',   text: 'text-slate-500',   Icon: PauseCircle },
} as const;

function timeAgo(iso: string | null): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function EmailHealthPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealth = useCallback(async (background = false) => {
    if (background) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await getEmailHealth();
      if (res.success && res.data) setData(res.data as HealthData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const id = setInterval(() => fetchHealth(true), 60000); // refresh each minute
    return () => clearInterval(id);
  }, [fetchHealth]);

  const allDown = data && data.totalConfigured > 0 && data.activeCount === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Email health</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Live status of every sending account. A suspended or rate-limited provider shows here the moment it fails.
          </p>
        </div>
        <button
          onClick={() => fetchHealth(true)}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Global outage banner */}
      {allDown && (
        <BlurFade delay={0.05}>
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10 p-4">
            <ServerCrash className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <div>
              <p className="text-sm font-bold text-red-800">No account can send right now</p>
              <p className="text-sm text-red-700 dark:text-red-400">
                Every configured account is disabled or failing. New leads will still be captured, but notification & auto-reply emails
                are not going out. Re-enable an account or add a fresh provider.
              </p>
            </div>
          </div>
        </BlurFade>
      )}

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Sending accounts', value: data ? `${data.activeCount} / ${data.totalConfigured}` : '—', hint: 'active / configured', Icon: Mail, tone: data && data.activeCount === 0 ? 'text-red-600' : 'text-emerald-600', tile: data && data.activeCount === 0 ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' },
          { label: 'Outages (24h)', value: data ? String(data.outages24h) : '—', hint: 'all-accounts-failed events', Icon: ServerCrash, tone: data && data.outages24h > 0 ? 'text-red-600' : 'text-slate-500', tile: data && data.outages24h > 0 ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-slate-50 dark:bg-slate-950/60 text-slate-500' },
          { label: 'Last outage', value: data ? timeAgo(data.lastOutageAt) : '—', hint: data?.lastOutageAt ? 'most recent total failure' : 'none recorded', Icon: XCircle, tone: 'text-slate-500', tile: 'bg-slate-50 dark:bg-slate-950/60 text-slate-500' },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{c.label}</p>
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${c.tile}`}><c.Icon className="h-4 w-4" /></span>
            </div>
            <p className={`mt-2 text-3xl font-bold tabular-nums ${c.tone}`}>{c.value}</p>
            <p className="mt-1 text-xs text-slate-400">{c.hint}</p>
          </div>
        ))}
      </div>

      {/* Accounts */}
      {loading && !data ? (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-10 text-center text-sm text-slate-500 dark:text-slate-400 shadow-sm">
          Loading account status…
        </div>
      ) : !data || data.accounts.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-10 text-center text-sm text-slate-500 dark:text-slate-400 shadow-sm">
          <Mail className="mx-auto mb-2 h-8 w-8 text-slate-300" />
          No sending accounts configured. Add <code className="rounded bg-slate-100 dark:bg-slate-800 px-1 py-0.5 text-xs">SMTP_*</code> credentials to your environment.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.accounts.map((acc, i) => {
            const s = STATUS[acc.status];
            return (
              <BlurFade key={acc.label} delay={0.05 + i * 0.04}>
                <div className={`rounded-2xl border ${s.ring} p-5 shadow-sm`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{acc.label.replace('account-', 'Account ')}</span>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${s.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${s.dot} ${acc.status === 'failing' ? 'animate-pulse' : ''}`} />
                          {s.label}
                        </span>
                      </div>
                      <p className="mt-1 truncate font-mono text-xs text-slate-500">{acc.user}</p>
                      <p className="truncate text-xs text-slate-400">from {acc.from}</p>
                    </div>
                    <s.Icon className={`h-5 w-5 shrink-0 ${s.text}`} />
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-200/60 pt-3 text-xs">
                    <span className="text-slate-500">
                      Failures (24h): <span className="font-bold text-slate-700 dark:text-slate-200 tabular-nums">{acc.failures24h}</span>
                    </span>
                    <span className="text-slate-400">
                      {acc.lastFailureAt ? `last ${timeAgo(acc.lastFailureAt)}` : 'no recent failures'}
                    </span>
                  </div>

                  {acc.lastError && acc.status !== 'disabled' && (
                    <p className="mt-2 truncate rounded-md bg-white/60 px-2 py-1 font-mono text-[11px] text-slate-500" title={acc.lastError}>
                      {acc.lastError}
                    </p>
                  )}
                </div>
              </BlurFade>
            );
          })}
        </div>
      )}

      <p className="text-xs text-slate-400">
        Disable a suspended account cleanly by setting <code className="rounded bg-slate-100 dark:bg-slate-800 px-1 py-0.5">SMTP_&lt;n&gt;_DISABLED=true</code> in your
        environment — it drops out of rotation without deleting its credentials.
      </p>
    </div>
  );
}
