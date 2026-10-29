'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Check, Copy, ArrowRight, Sparkles, AlertTriangle } from 'lucide-react';
import type { AppDict } from '@/lib/appDict';
import SnippetTabs from './SnippetTabs';

/**
 * Create a form: name it, pick (or create) the client it belongs to, give the
 * site URL, and get the working code for the stack — with the public form id
 * only. The e-mail that receives the leads never appears in the snippet.
 */

type NfDict = AppDict['dashboard']['nf'];
type SnDict = AppDict['snippets'];
type ClientLite = { id: string; name: string; email: string; website: string | null; lang: 'fr' | 'en' };
type Created = { id: string; name: string; portal_users?: { id: string; name: string; email: string; lang: string | null } | null };

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <code className="flex-1 truncate text-xs font-semibold text-slate-800 dark:text-slate-200">{value}</code>
        <button
          type="button"
          onClick={async () => { try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {} }}
          aria-label={`Copy ${label}`}
          className="shrink-0 rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 transition-colors hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}

async function loadClients(): Promise<ClientLite[]> {
  try {
    const r = await fetch('/api/developer/clients');
    const d = await r.json();
    return d?.success ? (d.clients as ClientLite[]) : [];
  } catch {
    return [];
  }
}

const inputCls = 'w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500';
const labelCls = 'text-xs font-semibold text-slate-700 dark:text-slate-300';

export default function NewFormButton({ prominent = false, label, m, sn }: { prominent?: boolean; label?: string; m: NfDict; sn: SnDict }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [clients, setClients] = useState<ClientLite[]>([]);
  const [clientId, setClientId] = useState<string>('');
  const [newClient, setNewClient] = useState({ name: '', email: '', invite: true });
  const [siteUrl, setSiteUrl] = useState('');
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [paywall, setPaywall] = useState(false);
  const [created, setCreated] = useState<{ form: Created; originsOpen: boolean; client: { name: string; email: string } } | null>(null);

  const apiUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const isNew = clientId === '__new__';

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    loadClients().then((list) => {
      if (cancelled) return;
      setClients(list);
      setClientId((cur) => cur || (list[0]?.id ?? '__new__'));
      const first = list[0];
      if (first) {
        setSiteUrl((cur) => cur || first.website || '');
        setLang(first.lang === 'en' ? 'en' : 'fr');
      }
    });
    return () => { cancelled = true; };
  }, [open]);

  function pickClient(id: string) {
    setClientId(id);
    const c = clients.find((x) => x.id === id);
    if (c) {
      setSiteUrl((cur) => cur || c.website || '');
      setLang(c.lang === 'en' ? 'en' : 'fr');
    }
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    setError('');
    setPaywall(false);
    try {
      let targetClientId = clientId;
      let clientInfo = clients.find((c) => c.id === clientId);

      if (isNew) {
        const rc = await fetch('/api/developer/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newClient.name, email: newClient.email, website: siteUrl, lang, invite: newClient.invite }),
        });
        const dc = await rc.json();
        if (rc.status === 409 && dc.client) {
          targetClientId = dc.client.id;
          clientInfo = dc.client;
        } else if (!rc.ok || !dc.success) {
          if (rc.status === 402) setPaywall(true);
          setError(dc.error || m.couldNotCreate);
          return;
        } else {
          targetClientId = dc.client.id;
          clientInfo = dc.client;
          setClients((prev) => [dc.client, ...prev]);
        }
      }
      if (!targetClientId) { setError(m.needClient); return; }

      const res = await fetch('/api/developer/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, clientId: targetClientId, siteUrl, lang }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const pu = data.form?.portal_users;
        setCreated({ form: data.form, originsOpen: !!data.originsOpen, client: { name: pu?.name || clientInfo?.name || '', email: pu?.email || clientInfo?.email || '' } });
        router.refresh();
      } else if (res.status === 402) {
        setPaywall(true);
        setError(data.error);
      } else {
        setError(data.error || m.couldNotCreate);
      }
    } catch {
      setError(m.couldNotReach);
    } finally {
      setBusy(false);
    }
  }

  function close() {
    setOpen(false);
    setTimeout(() => {
      setName(''); setError(''); setPaywall(false); setCreated(null); setSiteUrl(''); setNewClient({ name: '', email: '', invite: true });
    }, 250);
  }

  const btnBase = 'inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-colors hover:bg-blue-700';

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`${btnBase} ${prominent ? 'px-5 py-2.5' : 'px-4 py-2'}`}>
        <Plus className="h-4 w-4" /> {label || (prominent ? 'Create your first form' : 'New form')}
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:border dark:border-slate-800 dark:bg-slate-900 ${created ? 'max-w-3xl' : 'max-w-lg'}`}
            >
              <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/60">
                <h3 className="font-bold text-slate-900 dark:text-white">{created ? m.liveTitle : m.createTitle}</h3>
                <button type="button" onClick={close} aria-label="Close" className="rounded-full p-2 transition-colors hover:bg-slate-200 dark:hover:bg-slate-800">
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>

              {!created ? (
                <form onSubmit={create} className="space-y-4 overflow-y-auto p-6">
                  <p className="text-sm text-slate-600 dark:text-slate-400">{m.nameHint}</p>

                  <div className="space-y-1.5">
                    <label className={labelCls}>{m.nameLabel}</label>
                    <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder={m.namePlaceholder} maxLength={60} disabled={busy} className={inputCls} />
                  </div>

                  <div className="space-y-1.5">
                    <label className={labelCls}>{m.clientLabel}</label>
                    <select value={clientId} onChange={(e) => pickClient(e.target.value)} disabled={busy} className={inputCls}>
                      {clients.length === 0 && <option value="" disabled>{m.clientPlaceholder}</option>}
                      {clients.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.email}</option>)}
                      <option value="__new__">{m.newClientOption}</option>
                    </select>
                  </div>

                  {isNew && (
                    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/50">
                      <div className="space-y-1.5">
                        <label className={labelCls}>{m.clientNameLabel}</label>
                        <input value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} maxLength={80} disabled={busy} className={inputCls} />
                      </div>
                      <div className="space-y-1.5">
                        <label className={labelCls}>{m.clientEmailLabel}</label>
                        <input type="email" value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} disabled={busy} className={inputCls} />
                        <p className="text-[11px] text-slate-500">{m.clientEmailHint}</p>
                      </div>
                      <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <input type="checkbox" checked={newClient.invite} onChange={(e) => setNewClient({ ...newClient, invite: e.target.checked })} className="h-4 w-4 rounded border-slate-300" />
                        {m.inviteLabel}
                      </label>
                    </div>
                  )}

                  <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                    <div className="space-y-1.5">
                      <label className={labelCls}>{m.siteUrlLabel}</label>
                      <input value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} placeholder="https://acme.com" disabled={busy} className={inputCls} />
                      <p className="text-[11px] text-slate-500">{m.siteUrlHint}</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelCls}>{m.langLabel}</label>
                      <select value={lang} onChange={(e) => setLang(e.target.value as 'fr' | 'en')} disabled={busy} className={inputCls}>
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>

                  {error && (
                    <div role="alert" className="rounded-lg border border-red-100 bg-red-50 p-3 text-xs font-medium text-red-600">
                      {error}
                      {paywall && (
                        <Link href="/pricing" className="mt-2 flex items-center gap-1 font-semibold text-slate-900 hover:underline dark:text-white">
                          {m.seePro} <ArrowRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={busy || !name.trim() || (isNew && (!newClient.name.trim() || !newClient.email.trim())) || (!isNew && !clientId)}
                    className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-950"
                  >
                    {busy ? m.creating : m.createBtn}
                  </button>
                </form>
              ) : (
                <div className="space-y-4 overflow-y-auto p-6">
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-sm text-emerald-900 dark:text-emerald-300">
                      <strong>{created.form.name}</strong> {m.readyBody}
                      <br />
                      <span className="text-xs">{m.leadsGoTo} <strong>{created.client.name}</strong> ({created.client.email}) — {m.noEmailInCode}.</span>
                    </p>
                  </div>

                  {created.originsOpen && (
                    <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {m.originsOpenWarn}
                    </p>
                  )}

                  <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{m.envTitle}</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <CopyRow label="FORM_API_URL" value={apiUrl} />
                      <CopyRow label="FORM_ID" value={created.form.id} />
                    </div>
                  </div>

                  <SnippetTabs input={{ apiUrl, formId: created.form.id, lang, clientName: created.client.name }} labels={sn} />

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Link href={`/developer/dashboard/forms/${created.form.id}`} onClick={close} className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                      {m.openSettings} <ArrowRight className="h-4 w-4" />
                    </Link>
                    <a href="/docs" target="_blank" className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                      {m.openGuide}
                    </a>
                    <button type="button" onClick={close} className="flex-1 rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-950">
                      {m.done}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
