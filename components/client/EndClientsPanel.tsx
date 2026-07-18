'use client';

import { useEffect, useState } from 'react';
import { Users, Plus, Trash2, Check, Copy, Lock, X, Link2 } from 'lucide-react';

type Form = { id: string; name: string };
type EndClient = { id: string; name: string; email: string; created_at: string; forms: Form[] };

function Copyable({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-950/60 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <code className="flex-1 truncate text-xs font-semibold text-slate-800 dark:text-slate-200">{value}</code>
        <button
          onClick={async () => { try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {} }}
          aria-label={`Copy ${label}`}
          className="shrink-0 rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-1.5 text-slate-500 hover:text-slate-900 transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}

export default function EndClientsPanel() {
  const [users, setUsers] = useState<EndClient[]>([]);
  const [unassigned, setUnassigned] = useState<Form[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [limit, setLimit] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);

  const portalUrl = typeof window !== 'undefined' ? `${window.location.origin}/portal/login` : '/portal/login';

  async function load() {
    try {
      const res = await fetch('/api/client/portal-users');
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.portalUsers ?? []);
        setUnassigned(data.unassignedForms ?? []);
        setEnabled(data.clientPortals);
        setLimit(data.endClientLimit);
      }
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(''); setCreated(null);
    try {
      const res = await fetch('/api/client/portal-users', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCreated({ email: data.portalUser.email, password: data.password });
        setName(''); setEmail(''); setShowForm(false);
        load();
      } else {
        setError(data.error || 'Could not create the end-client.');
        if (res.status === 402) setEnabled(false);
      }
    } catch { setError('Could not reach the server.'); } finally { setBusy(false); }
  }

  async function assign(formId: string, portalUserId: string | null, doAssign: boolean) {
    await fetch('/api/client/portal-users/assign', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formId, portalUserId, assign: doAssign }),
    });
    load();
  }

  async function remove(id: string) {
    await fetch('/api/client/portal-users', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
    });
    load();
  }

  const atLimit = limit !== null && users.length >= limit;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">End-clients</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Give each client a private, branded portal to view only their own leads.</p>
        </div>
        {enabled && (
          <button
            onClick={() => { setShowForm((v) => !v); setCreated(null); }}
            disabled={atLimit}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> New end-client
          </button>
        )}
      </div>

      {!enabled && !loading && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 dark:bg-slate-950/60 p-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900"><Lock className="h-4.5 w-4.5 text-white" /></div>
          <p className="font-semibold text-slate-900 dark:text-white">Client portals start on the Solo plan</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">Create white-label portals so each client logs in and sees only their leads.</p>
          <a href="/pricing" className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-800 transition-colors">See plans</a>
        </div>
      )}

      {created && (
        <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-sm font-semibold text-emerald-900">End-client created — share these credentials now (the password is shown only once):</p>
          <Copyable label="Portal URL" value={portalUrl} />
          <Copyable label="Email" value={created.email} />
          <Copyable label="Temporary password" value={created.password} />
        </div>
      )}

      {showForm && enabled && (
        <form onSubmit={create} className="space-y-3 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5">
          {error && <p role="alert" className="rounded-lg border border-red-100 bg-red-50 p-3 text-xs font-medium text-red-600">{error}</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Client name (e.g. Acme Corp)" className="rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="client@company.com" className="rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
          </div>
          <button type="submit" disabled={busy} className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50">
            {busy ? 'Creating…' : 'Create end-client'}
          </button>
        </form>
      )}

      {enabled && (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link2 className="h-3.5 w-3.5" /> Portal login: <code className="text-slate-600 dark:text-slate-400">{portalUrl}</code>
          {limit !== null && <span className="ml-auto">{users.length} / {limit} end-clients</span>}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        enabled && users.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-10 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100"><Users className="h-5 w-5 text-slate-500" /></div>
            <p className="font-semibold text-slate-900 dark:text-white">No end-clients yet</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">Create one, then assign the forms whose leads they should see.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {users.map((u) => (
              <div key={u.id} className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-900 dark:text-white">{u.name}</p>
                    <p className="truncate text-xs text-slate-400">{u.email}</p>
                  </div>
                  <button onClick={() => remove(u.id)} aria-label={`Remove ${u.name}`} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Forms they can see</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {u.forms.length === 0 ? (
                    <span className="text-xs text-slate-400">None assigned yet.</span>
                  ) : (
                    u.forms.map((f) => (
                      <span key={f.id} className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        {f.name}
                        <button onClick={() => assign(f.id, null, false)} aria-label={`Unassign ${f.name}`} className="hover:text-blue-900"><X className="h-3 w-3" /></button>
                      </span>
                    ))
                  )}
                </div>

                {unassigned.length > 0 && (
                  <select
                    onChange={(e) => { if (e.target.value) assign(e.target.value, u.id, true); e.target.value = ''; }}
                    defaultValue=""
                    className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 outline-none focus:border-blue-400"
                  >
                    <option value="" disabled>+ Assign a form…</option>
                    {unassigned.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
