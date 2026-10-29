'use client';

import { useEffect, useState } from 'react';
import { KeyRound, Plus, Trash2, Copy, Check, Lock, Bot, Terminal, Webhook, RefreshCw } from 'lucide-react';
import { toast, confirmDialog } from '@/components/ui/Toaster';

type ApiKey = {
  id: string;
  name: string;
  key_prefix: string;
  revoked: boolean;
  last_used_at: string | null;
  created_at: string;
};

type WebhookForm = { id: string; name: string; webhook_url: string | null };

type DevDict = import('@/lib/appDict').AppDict['developer'];

async function fetchKeys(): Promise<{ keys: ApiKey[]; apiAccess: boolean } | null> {
  try {
    const res = await fetch('/api/developer/keys');
    const data = await res.json();
    return res.ok && data.success ? { keys: data.keys as ApiKey[], apiAccess: !!data.apiAccess } : null;
  } catch {
    return null;
  }
}

async function fetchWebhookSecret(): Promise<string | null> {
  try {
    const res = await fetch('/api/developer/webhook-secret');
    const data = await res.json();
    return res.ok && data.success ? (data.secret as string) : null;
  } catch {
    return null;
  }
}

async function fetchHookForms(): Promise<WebhookForm[] | null> {
  try {
    const res = await fetch('/api/developer/forms');
    const data = await res.json();
    return res.ok && data.success ? (data.forms as WebhookForm[]) : null;
  } catch {
    return null;
  }
}

function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {}
      }}
      aria-label="Copy"
      className="shrink-0 rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 hover:text-slate-900 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-white"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

export default function DeveloperPanel({ t }: { t: DevDict }) {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [apiAccess, setApiAccess] = useState(true);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [freshKey, setFreshKey] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Webhooks (per-form, self-serve)
  const [hookForms, setHookForms] = useState<WebhookForm[]>([]);
  const [hookDrafts, setHookDrafts] = useState<Record<string, string>>({});
  const [hookSaving, setHookSaving] = useState<Record<string, boolean>>({});
  const [hookMsg, setHookMsg] = useState<Record<string, string>>({});
  const [secret, setSecret] = useState<string | null>(null);
  const [secretShown, setSecretShown] = useState(false);

  async function rotateSecret() {
    const ok = await confirmDialog({ title: t.rotateConfirmTitle, body: t.rotateConfirmBody, confirmLabel: t.rotateBtn, cancelLabel: t.cancel, danger: true });
    if (!ok) return;
    try {
      const res = await fetch('/api/developer/webhook-secret', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) { setSecret(data.secret); setSecretShown(true); toast.success(t.rotated); }
      else toast.error(data.error || t.couldNotSave);
    } catch { toast.error(t.networkError); }
  }

  async function saveHook(formId: string) {
    setHookSaving((s) => ({ ...s, [formId]: true }));
    setHookMsg((m) => ({ ...m, [formId]: '' }));
    try {
      const res = await fetch('/api/developer/forms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId, webhookUrl: hookDrafts[formId] || '' }),
      });
      const data = await res.json();
      setHookMsg((m) => ({ ...m, [formId]: res.ok && data.success ? t.saved : data.error || t.couldNotSave }));
      if (res.ok && data.success) setTimeout(() => setHookMsg((m) => ({ ...m, [formId]: '' })), 2000);
    } catch {
      setHookMsg((m) => ({ ...m, [formId]: t.networkError }));
    } finally {
      setHookSaving((s) => ({ ...s, [formId]: false }));
    }
  }

  const mcpUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/mcp` : '/api/mcp';
  const mcpConfig = `{
  "mcpServers": {
    "inlet": {
      "type": "http",
      "url": "${mcpUrl}",
      "headers": { "Authorization": "Bearer YOUR_API_KEY" }
    }
  }
}`;

  async function load() {
    const data = await fetchKeys();
    if (data) {
      setKeys(data.keys.filter((k) => !k.revoked));
      setApiAccess(data.apiAccess);
    }
    setLoading(false);
  }
  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchKeys(), fetchHookForms(), fetchWebhookSecret()]).then(([keyData, forms, whsec]) => {
      if (cancelled) return;
      setSecret(whsec);
      if (keyData) {
        setKeys(keyData.keys.filter((k) => !k.revoked));
        setApiAccess(keyData.apiAccess);
      }
      setLoading(false);
      if (forms) {
        setHookForms(forms);
        setHookDrafts(Object.fromEntries(forms.map((f) => [f.id, f.webhook_url || ''])));
      }
    });
    return () => { cancelled = true; };
  }, []);

  async function createKey(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError('');
    setFreshKey(null);
    try {
      const res = await fetch('/api/developer/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name || 'default' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFreshKey(data.key.raw);
        setName('');
        load();
      } else {
        setError(data.error || t.couldNotCreate);
        if (res.status === 402) setApiAccess(false);
      }
    } catch {
      setError(t.couldNotReach);
    } finally {
      setCreating(false);
    }
  }

  async function revoke(id: string) {
    await fetch('/api/developer/keys', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    load();
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight dark:text-white">{t.title}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t.subtitle}
        </p>
      </div>

      {!apiAccess && !loading && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 dark:bg-white">
            <Lock className="h-4.5 w-4.5 text-white dark:text-slate-950" />
          </div>
          <p className="font-semibold text-slate-900 dark:text-white">{t.lockTitle}</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
            {t.lockBody}
          </p>
          <a
            href="/pricing"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
          >
            {t.seePlans}
          </a>
        </div>
      )}

      {/* Keys */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/60">
          <KeyRound className="h-4 w-4 text-slate-500" />
          <h2 className="font-bold text-slate-900 dark:text-white">{t.apiKeys}</h2>
        </div>
        <div className="space-y-4 p-6">
          {freshKey && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                {t.newKeyOnce}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 truncate rounded bg-white px-3 py-2 text-xs font-semibold text-slate-800 border border-emerald-100 dark:border-emerald-500/30 dark:bg-slate-950 dark:text-slate-200">
                  {freshKey}
                </code>
                <CopyBtn value={freshKey} />
              </div>
            </div>
          )}
          {error && (
            <p role="alert" className="rounded-lg border border-red-100 bg-red-50 p-3 text-xs font-medium text-red-600">{error}</p>
          )}

          {apiAccess && (
            <form onSubmit={createKey} className="flex gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.keyNamePlaceholder}
                maxLength={40}
                className="h-10 flex-1 rounded-lg border border-slate-200 px-3.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={creating}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                <Plus className="h-4 w-4" /> {creating ? t.creating : t.newKey}
              </button>
            </form>
          )}

          {loading ? (
            <p className="text-sm text-slate-400">{t.loading}</p>
          ) : keys.length === 0 ? (
            <p className="text-sm text-slate-500">{t.noKeys}</p>
          ) : (
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100 dark:divide-slate-800 dark:border-slate-800">
              {keys.map((k) => (
                <li key={k.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{k.name}</p>
                    <p className="text-xs text-slate-400">
                      <code>{k.key_prefix}…</code>
                      {' · '}
                      {k.last_used_at ? t.lastUsed.replace('{date}', new Date(k.last_used_at).toLocaleDateString()) : t.neverUsed}
                    </p>
                  </div>
                  <button
                    onClick={() => revoke(k.id)}
                    aria-label={`Revoke ${k.name}`}
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Webhooks — leads POSTed into the client's own stack */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/60">
          <Webhook className="h-4 w-4 text-slate-500" />
          <h2 className="font-bold text-slate-900 dark:text-white">{t.webhooksTitle}</h2>
        </div>
        <div className="space-y-4 p-6">
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
            {t.wDescA} <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-slate-800">submission.created</code> {t.wDescB}{' '}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-slate-800">X-Inlet-Signature</code> {t.wDescC}{' '}
            <a href="/docs" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">docs</a>{t.wDescD}
          </p>
          {secret && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{t.secretLabel}</p>
              <div className="mt-1 flex items-center gap-2">
                <code className="flex-1 truncate text-xs font-semibold text-slate-800 dark:text-slate-200">{secretShown ? secret : `${secret.slice(0, 10)}${'•'.repeat(24)}`}</code>
                <button type="button" onClick={() => setSecretShown((v) => !v)} className="shrink-0 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {secretShown ? '••••' : 'abc'}
                </button>
                <CopyBtn value={secret} />
                <button type="button" onClick={rotateSecret} aria-label={t.rotate} title={t.rotate} className="shrink-0 rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 transition-colors hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-white">
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">{t.secretHint}</p>
            </div>
          )}
          {hookForms.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">{t.createFormFirst}</p>
          ) : (
            <ul className="space-y-3">
              {hookForms.map((f) => (
                <li key={f.id} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                  <p className="mb-2 truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{f.name}</p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      value={hookDrafts[f.id] ?? ''}
                      onChange={(e) => setHookDrafts((d) => ({ ...d, [f.id]: e.target.value }))}
                      placeholder={t.webhookPlaceholder}
                      className="h-10 flex-1 rounded-lg border border-slate-200 px-3.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
                    />
                    <button
                      onClick={() => saveHook(f.id)}
                      disabled={hookSaving[f.id]}
                      className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                    >
                      {hookSaving[f.id] ? t.saving : t.save}
                    </button>
                  </div>
                  {hookMsg[f.id] && (
                    <p className={`mt-1.5 text-xs font-medium ${hookMsg[f.id] === t.saved ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600'}`}>
                      {hookMsg[f.id]}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* MCP */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/60">
          <Bot className="h-4 w-4 text-slate-500" />
          <h2 className="font-bold text-slate-900 dark:text-white">{t.mcpTitle}</h2>
        </div>
        <div className="space-y-4 p-6">
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
            {t.mcpDescA}{' '}
            <strong className="text-slate-900 dark:text-white">{t.mcpDescStrong}</strong>{' '}
            {t.mcpDescB}
          </p>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{t.endpoint}</p>
            <div className="mt-1 flex items-center gap-2">
              <code className="flex-1 truncate text-xs font-semibold text-slate-800 dark:text-slate-200">{mcpUrl}</code>
              <CopyBtn value={mcpUrl} />
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
            <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-2.5">
              <Terminal className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-xs text-slate-400">.mcp.json (Claude Code / Cursor)</span>
              <span className="ml-auto"><CopyBtn value={mcpConfig} /></span>
            </div>
            <pre className="overflow-x-auto p-4 text-[12px] leading-relaxed text-slate-200"><code>{mcpConfig}</code></pre>
          </div>
          <p className="text-xs text-slate-400">
            {t.toolsAvailable} <code>whoami</code>, <code>list_clients</code>, <code>create_client</code>, <code>invite_client</code>, <code>list_forms</code>, <code>create_form</code>, <code>setup_site</code>, <code>get_embed</code>, <code>set_origins</code>, <code>set_autoreply</code>, <code>assign_form</code>, <code>get_form_health</code>, <code>list_leads</code>, <code>get_lead</code>.
          </p>
        </div>
      </section>
    </div>
  );
}
