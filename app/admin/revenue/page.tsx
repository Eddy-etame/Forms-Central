'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DollarSign, Users, TrendingUp, CreditCard, ArrowUpRight } from 'lucide-react';
import { getRevenueStats } from '@/lib/actions';

type Stats = {
  total: number;
  paid: number;
  free: number;
  mrr: number;
  arpu: number;
  conversion: number;
  planBreakdown: { name: string; count: number; price: number }[];
  months: { key: string; label: string; signups: number; upgrades: number }[];
  recentUpgrades: { email: string; plan: string; when: string }[];
};

const PLAN_TONE: Record<string, string> = { Free: 'bg-slate-400', Solo: 'bg-blue-500', Pro: 'bg-violet-500', Max: 'bg-emerald-500' };

function Kpi({ icon: Icon, label, value, hint, tone }: { icon: any; label: string; value: string; hint: string; tone: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5">
      <div className={`absolute -right-3 -top-3 rounded-full ${tone} p-6 opacity-10`}><Icon className="h-8 w-8" /></div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-400">{hint}</p>
    </div>
  );
}

export default function RevenuePage() {
  const [s, setS] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setS((await getRevenueStats()) as Stats); }
      catch (e) { console.error('revenue load error', e); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) {
    return <div className="flex h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" /></div>;
  }
  if (!s) return <p className="text-sm text-slate-500">Could not load revenue.</p>;

  const maxPlan = Math.max(1, ...s.planBreakdown.map((p) => p.count));
  const money = (n: number) => `$${n.toLocaleString('en-US')}`;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Revenue &amp; subscribers</h2>
        <p className="text-sm text-slate-500">Who&apos;s paying, monthly recurring revenue, and growth.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={DollarSign} label="MRR" value={money(s.mrr)} hint={`${money(s.mrr * 12)} ARR`} tone="bg-emerald-500" />
        <Kpi icon={CreditCard} label="Paid subscribers" value={s.paid.toLocaleString('en-US')} hint={`of ${s.total.toLocaleString('en-US')} accounts`} tone="bg-blue-500" />
        <Kpi icon={TrendingUp} label="Conversion" value={`${(s.conversion * 100).toFixed(1)}%`} hint="paid ÷ total accounts" tone="bg-violet-500" />
        <Kpi icon={Users} label="ARPU" value={money(Math.round(s.arpu))} hint="avg revenue / paying user" tone="bg-slate-700" />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Plan breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <div className="mb-4 text-sm font-bold text-slate-900">Plan mix</div>
          <div className="space-y-3">
            {s.planBreakdown.map((p) => (
              <div key={p.name}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{p.name} {p.price > 0 && <span className="text-slate-400">· ${p.price}/mo</span>}</span>
                  <span className="font-bold tabular-nums text-slate-900">{p.count}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${PLAN_TONE[p.name]}`} style={{ width: `${(p.count / maxPlan) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
            <span className="text-slate-500">Paying</span>
            <span className="font-bold text-emerald-600">{s.paid}</span>
            <span className="text-slate-500">Free</span>
            <span className="font-bold text-slate-700">{s.free}</span>
          </div>
        </div>

        {/* Monthly growth */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-3">
          <div className="mb-4 text-sm font-bold text-slate-900">Growth · last 6 months</div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={s.months}>
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} cursor={{ fill: '#f1f5f9' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="signups" name="New signups" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="upgrades" name="New paid" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent upgrades */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4 text-sm font-bold text-slate-900">Recent paid accounts</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs font-semibold uppercase text-slate-400">
              <tr><th className="px-5 py-3">Account</th><th className="px-5 py-3">Plan</th><th className="px-5 py-3">Since</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {s.recentUpgrades.length === 0 ? (
                <tr><td colSpan={3} className="px-5 py-10 text-center text-slate-400">No paid subscribers yet — they&apos;ll appear here as accounts upgrade.</td></tr>
              ) : s.recentUpgrades.map((u, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-blue-700"><ArrowUpRight className="h-3 w-3" />{u.plan}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{new Date(u.when).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
