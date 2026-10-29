'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Plus, Trash2, Lock, Link2, Send, Pencil, MailCheck, Globe, CheckCircle2, Circle } from 'lucide-react';
import { toast, confirmDialog } from '@/components/ui/Toaster';
import type { AppDict } from '@/lib/appDict';

/**
 * Clients — the businesses a developer builds for. Each gets its leads by
 * e-mail and a private inbox opened with a set-password link; nobody ever
 * sees or receives a password.
 */

type Form = { id: string; name: string; is_active: boolean };
type Client = {
  id: string; name: string; email: string; website: string | null; lang: 'fr' | 'en';
  notify_leads: boolean; has_access: boolean; last_login_at: string | null; created_at: string; forms: Form[];
};
type ECDict = AppDict['endClients'];

const inputCls = 'rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500';

export default function ClientsPanel({ t }: { t: ECDict }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [limit, setLimit] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ name: '', email: '', website: '', lang: 'fr' as 'fr' | 'en', invite: true });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [emailedTo, setEmailedTo] = useState<string | null>(null);
  const [sending, setSending] = useState<Record<string, boolean>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [edit, setEdit] = useState({ name: '', email: '', website: '', lang: 'fr' as 'fr' | 'en', notifyLeads: true });

  const portalUrl = typeof window !== 'undefined' ? `${window.location.origin}/portal/login` : '/portal/login';

  async function load() {
    try {
      const res = await fetch('/api/developer/clients');
      const data = await res.json();
      if (res.ok && data.success) {
        setClients(data.clients ?? []);
        setLimit(data.clientLimit);
      }
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(''); setEmailedTo(null);
    try {
      const res = await fetch('/api/developer/clients', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: draft.name, email: draft.email, website: draft.website, lang: draft.lang, invite: draft.invite }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.invited) setEmailedTo(data.client.email);
        setDraft({ name: '', email: '', website: '', lang: 'fr', invite: true });
        setShowForm(false);
        load();
      } else if (res.status === 409 && data.code === 'CLIENT_EXISTS') {
        setError(t.createdExisting);
      } else {
        setError(data.error || t.couldNotCreate);
      }
    } catch { setError(t.couldNotReach); } finally { setBusy(false); }
  }

  async function sendAccess(c: Client) {
    const ok = await confirmDialog({ title: t.resetConfirmTitle, body: t.resetConfirmBody, confirmLabel: t.resetConfirmBtn, cancelLabel: t.cancel });
    if (!ok) return;
    setSending((s) => ({ ...s, [c.id]: true }));
    try {
      const res = await fetch('/api/developer/clients/invite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: c.id }) });
      const data = await res.json();
      if (res.ok && data.success) toast.success(t.resetOk);
      else toast.error(data.error || t.resetErr);
    } catch { toast.error(t.resetErr); } finally { setSending((s) => ({ ...s, [c.id]: false })); }
  }

  async function remove(c: Client) {
    if (c.forms.length > 0) { toast.error(t.deleteBlocked); return; }
    const ok = await confirmDialog({ title: t.deleteConfirmTitle, body: t.deleteConfirmBody, confirmLabel: t.deleteBtn, cancelLabel: t.cancel, danger: true });
    if (!ok) return;
    const res = await fetch('/api/developer/clients', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: c.id }) });
    const data = await res.json();
    if (!res.ok || !data.success) toast.error(data.error || t.deleteBlocked);
    load();
  }

  function startEdit(c: Client) {
    setEditing(c.id);
    setEdit({ name: c.name, email: c.email, website: c.website || '', lang: c.lang, notifyLeads: c.notify_leads });
  }

  async function saveEdit(id: string) {
    const res = await fetch('/api/developer/clients', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...edit }) });
    const data = await res.json();
    if (res.ok && data.success) { setEditing(null); load(); } else toast.error(data.error || t.couldNotCreate);
  }

  const atLimit = limit !== null && clients.length >= limit;

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t.title}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => { setShowForm((v) => !v); setEmailedTo(null); }}
          disabled={atLimit}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> {t.newBtn}
        </button>
      </div>

      {atLimit && !loading && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center dark:bg-slate-950/60">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900"><Lock className="h-4.5 w-4.5 text-white" /></div>
          <p className="font-semibold text-slate-900 dark:text-white">{t.lockTitle}</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">{t.lockBody}</p>
          <Link href="/pricing" className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-slate-900 px-5 text-sm font-medium text-white transition-colors hover:bg-slate-800">{t.seePlans}</Link>
        </div>
      )}

      {emailedTo && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-300">{t.emailedMsg.replace('{email}', emailedTo)}</p>
        </div>
      )}

      {showForm && !atLimit && (
        <form onSubmit={create} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          {error && <p role="alert" className="rounded-lg border border-red-100 bg-red-50 p-3 text-xs font-medium text-red-600">{error}</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder={t.namePlaceholder} required className={inputCls} />
            <input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} type="email" placeholder={t.emailPlaceholder} required className={inputCls} />
            <input value={draft.website} onChange={(e) => setDraft({ ...draft, website: e.target.value })} placeholder={t.websitePlaceholder} className={inputCls} />
            <select value={draft.lang} onChange={(e) => setDraft({ ...draft, lang: e.target.value as 'fr' | 'en' })} className={inputCls} aria-label={t.langLabel}>
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>
          <label className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
            <input type="checkbox" checked={draft.invite} onChange={(e) => setDraft({ ...draft, invite: e.target.checked })} className="mt-0.5 h-4 w-4 rounded border-slate-300" />
            <span>{t.inviteNow}<br /><span className="text-slate-400">{t.inviteHint}</span></span>
          </label>
          <button type="submit" disabled={busy} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50">
            {busy ? t.creating : t.createBtn}
          </button>
        </form>
      )}

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link2 className="h-3.5 w-3.5" /> {t.portalLogin} <code className="text-slate-600 dark:text-slate-400">{portalUrl}</code>
        {limit !== null && <span className="ml-auto">{t.count.replace('{n}', String(clients.length)).replace('{limit}', String(limit))}</span>}
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">{t.loading}</p>
      ) : clients.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800"><Users className="h-5 w-5 text-slate-500" /></div>
          <p className="font-semibold text-slate-900 dark:text-white">{t.emptyTitle}</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{t.emptyBody}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {clients.map((c) => (
            <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              {editing === c.id ? (
                <div className="space-y-2">
                  <input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} className={`${inputCls} w-full`} />
                  <input value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} type="email" className={`${inputCls} w-full`} />
                  <input value={edit.website} onChange={(e) => setEdit({ ...edit, website: e.target.value })} placeholder={t.websitePlaceholder} className={`${inputCls} w-full`} />
                  <div className="flex items-center gap-3">
                    <select value={edit.lang} onChange={(e) => setEdit({ ...edit, lang: e.target.value as 'fr' | 'en' })} className={inputCls}>
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                    </select>
                    <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <input type="checkbox" checked={edit.notifyLeads} onChange={(e) => setEdit({ ...edit, notifyLeads: e.target.checked })} className="h-4 w-4 rounded border-slate-300" />
                      {t.notifyLeads}
                    </label>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => saveEdit(c.id)} className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-slate-950">{t.save}</button>
                    <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">{t.cancelEdit}</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-900 dark:text-white">{c.name}</p>
                      <p className="truncate text-xs text-slate-400">{c.email}</p>
                      {c.website && (
                        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-400"><Globe className="h-3 w-3" /> {c.website}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button type="button" onClick={() => startEdit(c)} aria-label={t.edit} title={t.edit} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => remove(c)} aria-label={`${t.deleteBtn} ${c.name}`} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium ${c.has_access ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                      {c.has_access ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                      {c.has_access ? t.hasAccess : t.noAccessYet}
                    </span>
                    {c.notify_leads && <span className="rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{t.leadsBy}</span>}
                    <button
                      type="button"
                      onClick={() => sendAccess(c)}
                      disabled={sending[c.id]}
                      className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 font-semibold text-slate-700 transition-colors hover:border-slate-400 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
                    >
                      <Send className="h-3.5 w-3.5" /> {c.has_access ? t.resendAccess : t.sendAccess}
                    </button>
                  </div>

                  <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{t.formsTheySee}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {c.forms.length === 0 ? (
                      <span className="text-xs text-slate-400">{t.noneAssigned}</span>
                    ) : (
                      c.forms.map((f) => (
                        <Link key={f.id} href={`/developer/dashboard/forms/${f.id}`} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${f.is_active ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                          {f.name}
                        </Link>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
