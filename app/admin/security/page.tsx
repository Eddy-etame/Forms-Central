'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSecurityEvents } from '@/lib/actions';
import BlurFade from '@/components/magicui/blur-fade';
import { ShieldCheck, ShieldAlert, Ban, KeyRound, RefreshCw, Activity } from 'lucide-react';

interface SecurityEvent {
  id: number;
  event_type: string;
  severity: 'info' | 'warn' | 'critical';
  actor: string | null;
  ip: string | null;
  detail: string | null;
  created_at: string;
}

interface SecurityData {
  events: SecurityEvent[];
  failedLogins24h: number;
  rateBlocks24h: number;
  adminFails24h: number;
  topIps: { ip: string; count: number }[];
}

const SEV = {
  info:     { text: 'text-slate-600',  bg: 'bg-slate-100 text-slate-700' },
  warn:     { text: 'text-amber-700',  bg: 'bg-amber-100 text-amber-800' },
  critical: { text: 'text-red-700',    bg: 'bg-red-100 text-red-800' },
} as const;

function label(type: string): string {
  return type.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function SecurityPage() {
  const [data, setData] = useState<SecurityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [needsMigration, setNeedsMigration] = useState(false);

  const fetch = useCallback(async (background = false) => {
    if (background) setRefreshing(true); else setLoading(true);
    try {
      const res = await getSecurityEvents();
      if (res.success && res.data) { setData(res.data as SecurityData); setNeedsMigration(false); }
      else if (!res.success) setNeedsMigration(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const id = setInterval(() => fetch(true), 30000);
    return () => clearInterval(id);
  }, [fetch]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Security</h2>
          <p className="text-sm text-slate-500">
            Live audit trail — failed logins, rate-limit blocks and account activity across the platform.
          </p>
        </div>
        <button
          onClick={() => fetch(true)}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {needsMigration && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>One-time setup:</strong> run <code className="rounded bg-amber-100 px-1 py-0.5">migrations/migration_v12_security_events.sql</code> in
          the Supabase SQL editor to enable the audit trail. Events are already being recorded once the table exists.
        </div>
      )}

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Failed logins (24h)', value: data?.failedLogins24h ?? 0, Icon: ShieldAlert, tone: (data?.failedLogins24h ?? 0) > 0 ? 'text-amber-600' : 'text-emerald-600', tile: (data?.failedLogins24h ?? 0) > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600' },
          { label: 'Rate-limit blocks (24h)', value: data?.rateBlocks24h ?? 0, Icon: Ban, tone: (data?.rateBlocks24h ?? 0) > 0 ? 'text-amber-600' : 'text-slate-500', tile: (data?.rateBlocks24h ?? 0) > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500' },
          { label: 'Admin login failures (24h)', value: data?.adminFails24h ?? 0, Icon: KeyRound, tone: (data?.adminFails24h ?? 0) > 0 ? 'text-red-600' : 'text-emerald-600', tile: (data?.adminFails24h ?? 0) > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600' },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{c.label}</p>
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${c.tile}`}><c.Icon className="h-4 w-4" /></span>
            </div>
            <p className={`mt-2 text-3xl font-bold tabular-nums ${c.tone}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Top source IPs */}
      {data && data.topIps.length > 0 && (
        <BlurFade delay={0.1}>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-bold text-slate-900">Noisiest source IPs (24h)</h3>
            <div className="flex flex-wrap gap-2">
              {data.topIps.map((t) => (
                <span key={t.ip} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs">
                  <span className="font-mono text-slate-700">{t.ip}</span>
                  <span className="rounded-full bg-slate-900 px-1.5 py-0.5 font-bold text-white tabular-nums">{t.count}</span>
                </span>
              ))}
            </div>
          </div>
        </BlurFade>
      )}

      {/* Event stream */}
      <BlurFade delay={0.15}>
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-900 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="px-6 py-4">When</th>
                  <th className="px-6 py-4">Event</th>
                  <th className="px-6 py-4">Actor</th>
                  <th className="px-6 py-4">IP</th>
                  <th className="px-6 py-4">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && !data ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading events…</td></tr>
                ) : !data || data.events.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <ShieldCheck className="mb-2 h-8 w-8 text-emerald-400" />
                        No security events recorded yet — all quiet.
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.events.map((e) => {
                    const sev = SEV[e.severity] || SEV.info;
                    return (
                      <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                        <td className="whitespace-nowrap px-6 py-4 text-slate-500" title={new Date(e.created_at).toLocaleString('en-GB')}>
                          {timeAgo(e.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium ${sev.bg}`}>
                            {e.severity === 'critical' && <Activity className="h-3 w-3" />}
                            {label(e.event_type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {e.actor || <span className="text-slate-400 italic">—</span>}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{e.ip || '—'}</td>
                        <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate" title={e.detail || ''}>{e.detail || '—'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </BlurFade>
    </div>
  );
}
