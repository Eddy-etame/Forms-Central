'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, Users, FileText, CalendarDays, Download, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import NewFormButton from './NewFormButton';
import OnboardingChecklist from './OnboardingChecklist';

interface DashboardStats {
  allTime: number;
  past7Days: number;
  formsCount: number;
  recentLeads: any[];
  dailyTrends: { date: string, count: number }[];
  formPerformance: { name: string, count: number }[];
}

export default function GlobalDashboardClient({ stats, forms = [] }: { stats: DashboardStats; forms?: { id: string; name: string }[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<any | null>(null);

  const exportToCSV = () => {
    if (!stats || stats.recentLeads.length === 0) return;
    
    // Extract all unique keys from payloads to form headers
    const allKeys = new Set<string>();
    stats.recentLeads.forEach(lead => {
      Object.keys(lead.payload).forEach(k => allKeys.add(k));
    });
    
    const headers = ['Date', 'Form', ...Array.from(allKeys)];
    
    const csvRows = stats.recentLeads.map(lead => {
      const date = new Date(lead.created_at).toLocaleString('en-GB');
      const formName = lead.forms?.name || 'Unknown';
      
      const payloadData = Array.from(allKeys).map(key => {
        let val = lead.payload[key];
        if (typeof val === 'string') {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val || '';
      });
      
      return `"${date}","${formName}",${payloadData.join(',')}`;
    });
    
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = stats?.recentLeads.filter(lead => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    if (lead.forms?.name?.toLowerCase().includes(searchLower)) return true;
    return Object.values(lead.payload).some(val => 
      String(val).toLowerCase().includes(searchLower)
    );
  }) || [];

  // First-run: guide new users to their first lead instead of a dead, all-zero dashboard.
  if (!stats || stats.allTime === 0) {
    return <OnboardingChecklist formsCount={stats?.formsCount ?? 0} forms={forms} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight dark:text-white">Overview</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage your forms and review your latest leads.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <NewFormButton />
          <button
            onClick={exportToCSV}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800 transition-colors dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* The moment that matters: their very first lead = "my integration works" */}
      {stats?.allTime === 1 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-2xl bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500 p-px"
        >
          <div className="relative overflow-hidden rounded-[15px] bg-slate-950 px-6 py-5 text-white">
            <div aria-hidden className="pointer-events-none absolute inset-0">
              {[...Array(14)].map((_, i) => (
                <span
                  key={i}
                  className="confetti absolute block h-2 w-1 rounded-sm"
                  style={{
                    left: `${(i * 7 + 3) % 100}%`,
                    background: ['#60a5fa', '#a78bfa', '#22d3ee', '#34d399', '#fbbf24'][i % 5],
                    animationDelay: `${(i % 7) * 0.35}s`,
                  }}
                />
              ))}
            </div>
            <div className="relative flex flex-wrap items-center gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-xl">🎉</span>
              <div>
                <p className="text-base font-bold">Your first lead just landed.</p>
                <p className="text-sm text-slate-300">The integration works — every submission from here on arrives exactly like this.</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {stats?.formsCount === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-8 text-center dark:border-blue-500/25 dark:bg-blue-500/5"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create your first form</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
            Name it, copy two values into your website, and submissions start landing
            here — with spam blocked and branded auto-replies sent for you.
          </p>
          <div className="mt-5 flex justify-center">
            <NewFormButton prominent />
          </div>
        </motion.div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Total leads", value: stats?.allTime || 0, icon: Users, hint: "All-time volume", trend: TrendingUp, tone: "text-blue-600 dark:text-blue-400", tile: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400", glow: "from-blue-500/15" },
          { label: "Last 7 days", value: stats?.past7Days || 0, icon: CalendarDays, hint: "Recent momentum", trend: TrendingUp, tone: "text-emerald-600 dark:text-emerald-400", tile: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400", glow: "from-emerald-500/15" },
          { label: "Active forms", value: stats?.formsCount || 0, icon: FileText, hint: "Conversion sources", trend: FileText, tone: "text-violet-600 dark:text-violet-400", tile: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400", glow: "from-violet-500/15" },
        ].map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div aria-hidden className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${c.glow} to-transparent blur-2xl`} />
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{c.label}</p>
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${c.tile}`}><c.icon className="h-[18px] w-[18px]" /></span>
            </div>
            <h3 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 tabular-nums dark:text-white">{(c.value as number).toLocaleString("en-US")}</h3>
            <div className={`mt-3 flex items-center gap-1 text-sm font-medium ${c.tone}`}>
              <c.trend className="h-4 w-4" /> {c.hint}
            </div>
          </motion.div>
        ))}
      </div>

      {stats && stats.allTime >= 15 ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"><BarChart3 className="h-[18px] w-[18px]" /></span>
              <div>
                <h3 className="font-bold leading-tight text-slate-900 dark:text-white">Submission trend</h3>
                <p className="text-xs text-slate-500">Last 30 days</p>
              </div>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.dailyTrends || []}>
                  <defs>
                    <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.12)', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="url(#barFill)" radius={[5, 5, 0, 0]} maxBarSize={38} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col"
          >
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"><FileText className="h-[18px] w-[18px]" /></span>
              <div>
                <h3 className="font-bold leading-tight text-slate-900 dark:text-white">Top forms</h3>
                <p className="text-xs text-slate-500">By share of leads</p>
              </div>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto">
              {stats?.formPerformance.length === 0 ? (
                <p className="text-sm text-slate-500 text-center mt-10">No data yet.</p>
              ) : (
                stats?.formPerformance.map((form, idx) => {
                  const total = stats.allTime || 1;
                  const percentage = Math.round((form.count / total) * 100);
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex min-w-0 items-center gap-2 pr-4">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[11px] font-bold text-slate-500 tabular-nums dark:bg-slate-800 dark:text-slate-400">{idx + 1}</span>
                          <span className="truncate font-medium text-slate-700 dark:text-slate-300">{form.name}</span>
                        </span>
                        <span className="shrink-0 font-bold text-slate-900 tabular-nums dark:text-white">{form.count}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-[width] duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 shadow-sm text-center dark:border-blue-500/20 dark:bg-blue-500/5"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/15">
            <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Advanced analytics unlocks at 15 leads</h3>
          <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto dark:text-slate-400">
            Charts and performance stats unlock automatically once you reach <strong>15 leads</strong>. Only {15 - (stats?.allTime || 0)} more to go!
          </p>
        </motion.div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 dark:border-slate-800 dark:bg-slate-900/60">
          <h3 className="font-bold text-slate-900 dark:text-white">Lead database</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search name, email…" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-white border-b border-slate-100 text-xs font-semibold uppercase text-slate-400 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-500">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Form</th>
                <th className="px-6 py-4">Primary identity</th>
                <th className="px-6 py-4">Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No leads match your search.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const date = new Date(lead.created_at).toLocaleDateString('en-GB', {
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                  });
                  const nameKey = Object.keys(lead.payload).find(k => k.toLowerCase() === 'nom' || k.toLowerCase() === 'name');
                  const emailKey = Object.keys(lead.payload).find(k => k.toLowerCase() === 'email');
                  const name = nameKey ? lead.payload[nameKey] : 'Unknown';
                  const email = emailKey ? lead.payload[emailKey] : '—';
                  
                  const otherData = Object.entries(lead.payload).filter(([k]) => k !== nameKey && k !== emailKey);
                  
                  return (
                    <tr 
                      key={lead.id} 
                      onClick={() => setSelectedLead(lead)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors dark:hover:bg-slate-800/50"
                    >
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-900 dark:text-slate-200">
                        {date}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                          {lead.forms?.name || 'Unknown'}
                        </span>
                        {/* AI verdict — labels only, the lead is always kept */}
                        {lead.spam_status === 'spam' && (
                          <span title={lead.spam_reason || undefined} className="ml-2 inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                            AI: spam
                          </span>
                        )}
                        {lead.spam_status === 'suspect' && (
                          <span title={lead.spam_reason || undefined} className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                            AI: suspect
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-white">{name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-md truncate text-xs text-slate-500">
                          {otherData.map(([k, v]) => (
                            <span key={k} className="mr-3">
                              <span className="font-semibold text-slate-700 capitalize dark:text-slate-300">{k.replace(/_/g, ' ')}:</span> {String(v)}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLead(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh] dark:bg-slate-900 dark:border dark:border-slate-800"
            >
              <div className="border-b border-slate-100 bg-slate-50 px-6 py-4 flex items-center justify-between shrink-0 dark:border-slate-800 dark:bg-slate-900">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg dark:text-white">Submission details</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Received {new Date(selectedLead.created_at).toLocaleString('en-GB')} via <strong>{selectedLead.forms?.name}</strong>
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedLead(null)}
                  className="rounded-full p-2 hover:bg-slate-200 transition-colors dark:hover:bg-slate-700"
                >
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(selectedLead.payload).map(([key, value]) => {
                    const isSupabaseUrl = typeof value === 'string' && value.startsWith('http') && value.includes('supabase.co/storage');
                    
                    return (
                      <div key={key} className="rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                          {key.replace(/_/g, ' ')}
                        </p>
                        
                        {isSupabaseUrl ? (
                          <div className="flex flex-col gap-3">
                            <div className="relative h-32 w-full overflow-hidden rounded-md border border-slate-200 bg-white flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={String(value)} alt={key} className="max-h-full max-w-full object-contain" />
                            </div>
                            <a 
                              href={`/api/download?url=${encodeURIComponent(String(value))}`}
                              download
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center justify-center gap-2 rounded bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors self-start"
                            >
                              <Download className="h-3 w-3" />
                              Download file
                            </a>
                          </div>
                        ) : (
                          <p className="text-sm font-medium text-slate-900 break-words whitespace-pre-wrap dark:text-slate-100">
                            {String(value)}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="border-t border-slate-100 px-6 py-4 bg-slate-50 flex justify-end shrink-0">
                <button 
                  onClick={() => setSelectedLead(null)}
                  className="rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
