'use client';

import { useEffect, useMemo, useState } from 'react';
import { isAttachmentValue, downloadHref } from '@/lib/attachments';
import { Search, X, Inbox, Download, Mail, Phone, Check, RotateCcw } from 'lucide-react';
import { useLocale } from '@/lib/useLocale';
import { getAppDict } from '@/lib/appDict';
import ExportButton from '@/components/ExportButton';

type Lead = { id: string; form_id: string; payload: Record<string, unknown>; created_at: string; handled_at?: string | null };
type Form = { id: string; name: string };
type Tab = 'todo' | 'done' | 'all';

const DAY = 86_400_000;

/** The fields a business owner looks for first, whatever the form called them. */
function pick(payload: Record<string, unknown>, pattern: RegExp): string {
  const key = Object.keys(payload).find((k) => pattern.test(k));
  const v = key ? payload[key] : '';
  return typeof v === 'string' ? v.trim() : v == null ? '' : String(v);
}
const NAME = /^(name|nom|pr[ée]nom|first.?name|full.?name|nom.?complet)$/i;
const EMAIL = /^(e-?mail|courriel)$/i;
const PHONE = /^(phone|t[ée]l|t[ée]l[ée]phone|mobile|portable)$/i;
const MESSAGE = /^(message|msg|comment|commentaire|demande|question)$/i;

export default function PortalLeads() {
  const locale = useLocale();
  const t = getAppDict(locale).portal.home;
  const dateLocale = locale === 'fr' ? 'fr-FR' : 'en-GB';

  const [forms, setForms] = useState<Form[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [supportsHandled, setSupportsHandled] = useState(true);
  const [keptDays, setKeptDays] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(0);
  const [search, setSearch] = useState('');
  const [formFilter, setFormFilter] = useState<string>('all');
  const [tab, setTab] = useState<Tab>('todo');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/portal/leads');
        const data = await res.json();
        if (alive && res.ok && data.success) {
          const list: Lead[] = data.leads ?? [];
          setForms(data.forms ?? []);
          setLeads(list);
          setSupportsHandled(data.handledSupported !== false);
          setKeptDays(typeof data.keptDays === 'number' ? data.keptDays : null);
          // Open on what needs attention; when nothing does, show everything.
          if (data.handledSupported === false || !list.some((l) => !l.handled_at)) setTab('all');
        }
      } finally {
        if (alive) { setNow(Date.now()); setLoading(false); }
      }
    })();
    const tick = setInterval(() => setNow(Date.now()), 60_000); // the waiting clocks stay true
    return () => { alive = false; clearInterval(tick); };
  }, []);

  const formName = (id: string) => forms.find((f) => f.id === id)?.name ?? t.formFallback;

  /** "25 min", "3 h", "2 days" — how long something has been waiting. */
  const age = (ms: number) => {
    const min = Math.floor(ms / 60_000);
    if (min < 1) return t.justNow;
    if (min < 60) return `${min} ${t.unitMin}`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h} ${t.unitHour}`;
    const d = Math.floor(h / 24);
    return `${d} ${d === 1 ? t.unitDay : t.unitDays}`;
  };

  const waiting = useMemo(() => leads.filter((l) => !l.handled_at), [leads]);
  const handled = useMemo(() => leads.filter((l) => !!l.handled_at), [leads]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const pool = !supportsHandled || tab === 'all' ? leads : tab === 'todo' ? waiting : handled;
    return pool.filter((l) => {
      if (formFilter !== 'all' && l.form_id !== formFilter) return false;
      if (!q) return true;
      return Object.values(l.payload).some((v) => String(v).toLowerCase().includes(q));
    });
  }, [leads, waiting, handled, tab, search, formFilter, supportsHandled]);

  // The last seven days, oldest first: one bar per day.
  const week = useMemo(() => {
    if (!now) return [];
    const start = new Date(now); start.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const from = start.getTime() - (6 - i) * DAY;
      const count = leads.filter((l) => { const ts = new Date(l.created_at).getTime(); return ts >= from && ts < from + DAY; }).length;
      return { from, count, label: new Date(from).toLocaleDateString(dateLocale, { weekday: 'narrow' }), today: i === 6 };
    });
  }, [leads, now, dateLocale]);
  const weekTotal = week.reduce((n, d) => n + d.count, 0);
  const weekMax = Math.max(1, ...week.map((d) => d.count));

  const selected = selectedId ? leads.find((l) => l.id === selectedId) ?? null : null;

  async function setHandled(lead: Lead, value: boolean) {
    if (saving) return;
    setSaving(lead.id); setSaveError(false);
    const before = lead.handled_at ?? null;
    // optimistic: the list answers at once, the server confirms
    setLeads((list) => list.map((l) => (l.id === lead.id ? { ...l, handled_at: value ? new Date().toISOString() : null } : l)));
    try {
      const res = await fetch('/api/portal/leads', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: lead.id, handled: value }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error('save');
      setLeads((list) => list.map((l) => (l.id === lead.id ? { ...l, handled_at: data.handled_at } : l)));
    } catch {
      setLeads((list) => list.map((l) => (l.id === lead.id ? { ...l, handled_at: before } : l)));
      setSaveError(true);
    } finally {
      setSaving(null);
    }
  }

  if (loading) return <p className="text-sm text-slate-400">{t.loadingLeads}</p>;

  if (forms.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <Inbox className="h-6 w-6 text-slate-400" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">{t.emptyTitle}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{t.emptyBody}</p>
      </div>
    );
  }

  const oldestWaiting = waiting.length ? waiting[waiting.length - 1] : null; // leads arrive newest first
  const headline = !supportsHandled
    ? (forms.length > 1 ? t.totalAcrossMany : t.totalAcrossOne).replace('{n}', String(leads.length)).replace('{m}', String(forms.length))
    : leads.length === 0
      ? t.emptyBody
      : waiting.length === 0
        ? t.allDone
        : (waiting.length === 1 ? t.waitingOne : t.waitingMany)
            .replace('{n}', String(waiting.length))
            .replace('{age}', age(now - new Date(oldestWaiting!.created_at).getTime()));

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'todo', label: t.tabTodo, count: waiting.length },
    { id: 'done', label: t.tabDone, count: handled.length },
    { id: 'all', label: t.tabAll, count: leads.length },
  ];

  return (
    <div className="space-y-6">
      {/* What is waiting, said in one sentence — and the week at a glance */}
      <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-sm font-semibold uppercase tracking-wider text-slate-500">{t.yourLeads}</h1>
          <p className="mt-2 text-balance text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl">{headline}</p>
          {supportsHandled && waiting.length === 0 && leads.length > 0 && (
            <p className="mt-1.5 text-sm text-slate-500">{t.allDoneSub.replace('{age}', age(now - new Date(leads[0].created_at).getTime()))}</p>
          )}
        </div>
        {week.length > 0 && (
          <div className="shrink-0" aria-label={`${t.weekLabel}: ${weekTotal}`}>
            <div className="flex h-12 items-end gap-2" aria-hidden>
              {week.map((d) => (
                <div key={d.from} className="flex w-4 flex-col items-center justify-end gap-1.5">
                  {/* a slim pill per day; an empty day is a dot, so one busy day never reads as a brick */}
                  <div
                    className="w-2.5 rounded-full"
                    style={{ height: `${d.count ? Math.max(10, Math.round((d.count / weekMax) * 30)) : 4}px`, background: d.count ? 'var(--brand, #0f172a)' : '#cbd5e1', opacity: d.count && !d.today ? 0.5 : 1 }}
                  />
                  <span className={`text-[10px] leading-none ${d.today ? 'font-bold text-slate-700' : 'text-slate-400'}`}>{d.label}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500 sm:text-right">
              {t.weekLabel} · <span className="font-semibold text-slate-700">{(weekTotal === 1 ? t.weekCountOne : t.weekCount).replace('{n}', String(weekTotal))}</span>
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {supportsHandled && (
          <div role="tablist" aria-label={t.yourLeads} className="inline-flex shrink-0 self-start rounded-xl border border-slate-200 bg-white p-1">
            {tabs.map((x) => (
              <button
                key={x.id}
                role="tab"
                aria-selected={tab === x.id}
                onClick={() => setTab(x.id)}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${tab === x.id ? 'text-[var(--brand-ink,#fff)]' : 'text-slate-600 hover:text-slate-900'}`}
                style={tab === x.id ? { background: 'var(--brand, #0f172a)' } : undefined}
              >
                {x.label}
                <span className={`rounded-full px-1.5 text-xs tabular-nums ${tab === x.id ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>{x.count}</span>
              </button>
            ))}
          </div>
        )}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            aria-label={t.searchPlaceholder}
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition-all focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
        </div>
        {forms.length > 1 && (
          <select
            value={formFilter}
            onChange={(e) => setFormFilter(e.target.value)}
            aria-label={t.allForms}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400"
          >
            <option value="all">{t.allForms}</option>
            {forms.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        )}
        <ExportButton
          href="/api/portal/leads/export"
          label={t.exportCsv}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300"
        />
      </div>

      {saveError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">{t.errSave}</p>}
      {keptDays !== null && leads.length > 0 && (
        <p className="text-xs leading-5 text-slate-500">
          {t.keptNote.replace('{window}', keptDays === 365 ? t.keptYear : t.keptDays.replace('{n}', String(keptDays)))}
        </p>
      )}

      <ul className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {filtered.length === 0 ? (
          <li className="px-6 py-14 text-center text-sm text-slate-500">
            {search || formFilter !== 'all' ? t.noMatch : tab === 'todo' ? t.emptyTodo : tab === 'done' ? t.emptyDone : t.emptyBody}
          </li>
        ) : (
          filtered.map((l) => {
            const name = pick(l.payload, NAME) || pick(l.payload, EMAIL) || t.formFallback;
            const preview = pick(l.payload, MESSAGE) || Object.entries(l.payload).filter(([k]) => !NAME.test(k) && !EMAIL.test(k)).map(([, v]) => String(v)).join(' · ');
            const waitedMs = now - new Date(l.created_at).getTime();
            const isWaiting = supportsHandled && !l.handled_at;
            const urgency = !isWaiting ? 'text-slate-400' : waitedMs > 3 * DAY ? 'text-red-600' : waitedMs > DAY ? 'text-amber-600' : 'text-slate-500';
            return (
              <li key={l.id} className="border-b border-slate-100 last:border-b-0">
                <button onClick={() => setSelectedId(l.id)} className="flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50 sm:px-6">
                  <span
                    aria-hidden
                    className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${isWaiting ? '' : 'border border-slate-300 bg-white'}`}
                    style={isWaiting ? { background: 'var(--brand, #0f172a)' } : undefined}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className={`truncate text-sm ${isWaiting ? 'font-bold text-slate-900' : 'font-medium text-slate-600'}`}>{name}</span>
                      {forms.length > 1 && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">{formName(l.form_id)}</span>}
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-slate-500">{preview}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className={`block text-xs font-semibold ${urgency}`}>
                      {!supportsHandled
                        ? new Date(l.created_at).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short' })
                        : isWaiting
                          ? t.waitingFor.replace('{age}', age(waitedMs))
                          : t.handledOn.replace('{date}', new Date(l.handled_at as string).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short' }))}
                    </span>
                    <span className="mt-0.5 hidden text-[11px] text-slate-400 sm:block">
                      {new Date(l.created_at).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </span>
                </button>
              </li>
            );
          })
        )}
      </ul>

      {selected && (() => {
        const name = pick(selected.payload, NAME);
        const email = pick(selected.payload, EMAIL);
        const phone = pick(selected.payload, PHONE);
        const mailto = email
          ? `mailto:${email}?subject=${encodeURIComponent(t.replySubject)}&body=${encodeURIComponent(`${t.replyGreeting.replace('{name}', name || '').replace(/\s+,/, ',')}\n\n`)}`
          : '';
        const isHandled = !!selected.handled_at;
        return (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
            <div onClick={() => setSelectedId(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <div role="dialog" aria-modal="true" aria-label={t.submissionTitle} className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-bold text-slate-900">{name || email || t.submissionTitle}</h3>
                  <p className="text-xs text-slate-500">
                    {new Date(selected.created_at).toLocaleString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} · {formName(selected.form_id)}
                  </p>
                </div>
                <button onClick={() => setSelectedId(null)} aria-label={t.close} className="rounded-full p-2 transition-colors hover:bg-slate-100">
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-6 py-3">
                {mailto && (
                  <a href={mailto} className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold text-[var(--brand-ink,#fff)]" style={{ background: 'var(--brand, #0f172a)' }}>
                    <Mail className="h-4 w-4" /> {t.reply}
                  </a>
                )}
                {phone && (
                  <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300">
                    <Phone className="h-4 w-4" /> {t.call}
                  </a>
                )}
                {supportsHandled && (
                  <button
                    onClick={() => setHandled(selected, !isHandled)}
                    disabled={saving === selected.id}
                    className="ml-auto inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 disabled:opacity-60"
                  >
                    {isHandled ? <RotateCcw className="h-4 w-4" /> : <Check className="h-4 w-4 text-emerald-600" />}
                    {isHandled ? t.reopen : t.markHandled}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 overflow-y-auto p-6 sm:grid-cols-2">
                {Object.entries(selected.payload).map(([k, v]) => {
                  const long = typeof v === 'string' && v.length > 90;
                  return (
                    <div key={k} className={`rounded-lg border border-slate-100 bg-slate-50 p-4 ${long ? 'sm:col-span-2' : ''}`}>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{k.replace(/_/g, ' ')}</p>
                      {isAttachmentValue(v) ? (
                        <a href={downloadHref(selected.id, k)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900">
                          <Download className="h-3.5 w-3.5" /> {t.downloadFile}
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
        );
      })()}
    </div>
  );
}
