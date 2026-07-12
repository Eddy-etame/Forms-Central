'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, X, Inbox, Download } from 'lucide-react';

type Lead = { id: string; form_id: string; payload: Record<string, unknown>; created_at: string };
type Form = { id: string; name: string };

export default function PortalLeads() {
  const [forms, setForms] = useState<Form[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formFilter, setFormFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Lead | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/portal/leads');
        const data = await res.json();
        if (res.ok && data.success) {
          setForms(data.forms ?? []);
          setLeads(data.leads ?? []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formName = (id: string) => forms.find((f) => f.id === id)?.name ?? 'Form';

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return leads.filter((l) => {
      if (formFilter !== 'all' && l.form_id !== formFilter) return false;
      if (!q) return true;
      return Object.values(l.payload).some((v) => String(v).toLowerCase().includes(q));
    });
  }, [leads, search, formFilter]);

  function exportCsv() {
    if (filtered.length === 0) return;
    const keys = new Set<string>();
    filtered.forEach((l) => Object.keys(l.payload).forEach((k) => keys.add(k)));
    const cols = ['Date', 'Form', ...keys];
    const rows = filtered.map((l) => {
      const base = [new Date(l.created_at).toLocaleString('en-GB'), formName(l.form_id)];
      const vals = [...keys].map((k) => {
        const v = l.payload[k];
        return typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : (v ?? '');
      });
      return [...base.map((b) => `"${b}"`), ...vals].join(',');
    });
    const blob = new Blob([[cols.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <p className="text-sm text-slate-400">Loading your leads…</p>;

  if (forms.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <Inbox className="h-6 w-6 text-slate-400" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">No leads yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          When your forms receive submissions, they&apos;ll appear here in real time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Your leads</h1>
          <p className="mt-1 text-sm text-slate-500">{leads.length} total across {forms.length} form{forms.length > 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-slate-300 transition-colors"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads…"
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>
        {forms.length > 1 && (
          <select
            value={formFilter}
            onChange={(e) => setFormFilter(e.target.value)}
            className="rounded-lg border border-slate-200 py-2.5 px-3 text-sm outline-none focus:border-blue-400"
          >
            <option value="all">All forms</option>
            {forms.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs font-semibold uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Form</th>
                <th className="px-6 py-4">Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-500">No leads match your search.</td></tr>
              ) : (
                filtered.map((l) => (
                  <tr key={l.id} onClick={() => setSelected(l)} className="cursor-pointer hover:bg-slate-50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-900">
                      {new Date(l.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">{formName(l.form_id)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-md truncate text-xs text-slate-500">
                        {Object.entries(l.payload).slice(0, 4).map(([k, v]) => (
                          <span key={k} className="mr-3"><span className="font-semibold text-slate-700 capitalize">{k.replace(/_/g, ' ')}:</span> {String(v)}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setSelected(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
          <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Submission</h3>
                <p className="text-xs text-slate-500">{new Date(selected.created_at).toLocaleString('en-GB')} · {formName(selected.form_id)}</p>
              </div>
              <button onClick={() => setSelected(null)} aria-label="Close" className="rounded-full p-2 hover:bg-slate-200 transition-colors">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 overflow-y-auto p-6 sm:grid-cols-2">
              {Object.entries(selected.payload).map(([k, v]) => {
                const isFile = typeof v === 'string' && v.startsWith('http') && v.includes('supabase.co/storage');
                return (
                  <div key={k} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{k.replace(/_/g, ' ')}</p>
                    {isFile ? (
                      <a href={`/api/download?url=${encodeURIComponent(String(v))}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline">
                        <Download className="h-3.5 w-3.5" /> Download file
                      </a>
                    ) : (
                      <p className="whitespace-pre-wrap break-words text-sm font-medium text-slate-900">{String(v)}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
