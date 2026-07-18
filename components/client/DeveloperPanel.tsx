'use client';

import { useEffect, useState } from 'react';
import { KeyRound, Plus, Trash2, Copy, Check, Lock, Bot, Terminal } from 'lucide-react';

type ApiKey = {
  id: string;
  name: string;
  key_prefix: string;
  revoked: boolean;
  last_used_at: string | null;
  created_at: string;
};

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

export default function DeveloperPanel() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [apiAccess, setApiAccess] = useState(true);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [freshKey, setFreshKey] = useState<string | null>(null);
  const [error, setError] = useState('');

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
    try {
      const res = await fetch('/api/client/keys');
      const data = await res.json();
      if (res.ok && data.success) {
        setKeys(data.keys.filter((k: ApiKey) => !k.revoked));
        setApiAccess(data.apiAccess);
      }
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function createKey(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError('');
    setFreshKey(null);
    try {
      const res = await fetch('/api/client/keys', {
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
        setError(data.error || 'Could not create the key.');
        if (res.status === 402) setApiAccess(false);
      }
    } catch {
      setError('Could not reach the server.');
    } finally {
      setCreating(false);
    }
  }

  async function revoke(id: string) {
    await fetch('/api/client/keys', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    load();
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight dark:text-white">Developer</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          API keys and the MCP server — let your AI assistant run your forms.
        </p>
      </div>

      {!apiAccess && !loading && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 dark:bg-white">
            <Lock className="h-4.5 w-4.5 text-white dark:text-slate-950" />
          </div>
          <p className="font-semibold text-slate-900 dark:text-white">API &amp; MCP access starts on the Solo plan</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
            Connect Claude, Cursor or any MCP client and let it create forms and read your leads for you.
          </p>
          <a
            href="/pricing"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
          >
            See plans
          </a>
        </div>
      )}

      {/* Keys */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/60">
          <KeyRound className="h-4 w-4 text-slate-500" />
          <h2 className="font-bold text-slate-900 dark:text-white">API keys</h2>
        </div>
        <div className="space-y-4 p-6">
          {freshKey && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Your new key — shown only once, store it now
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
                placeholder="Key name (e.g. claude-code)"
                maxLength={40}
                className="h-10 flex-1 rounded-lg border border-slate-200 px-3.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={creating}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                <Plus className="h-4 w-4" /> {creating ? 'Creating…' : 'New key'}
              </button>
            </form>
          )}

          {loading ? (
            <p className="text-sm text-slate-400">Loading…</p>
          ) : keys.length === 0 ? (
            <p className="text-sm text-slate-500">No active keys.</p>
          ) : (
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100 dark:divide-slate-800 dark:border-slate-800">
              {keys.map((k) => (
                <li key={k.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{k.name}</p>
                    <p className="text-xs text-slate-400">
                      <code>{k.key_prefix}…</code>
                      {' · '}
                      {k.last_used_at ? `last used ${new Date(k.last_used_at).toLocaleDateString('en-GB')}` : 'never used'}
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

      {/* MCP */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/60">
          <Bot className="h-4 w-4 text-slate-500" />
          <h2 className="font-bold text-slate-900 dark:text-white">MCP server — your AI runs your forms</h2>
        </div>
        <div className="space-y-4 p-6">
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
            Connect Claude Code, Cursor, or any MCP client and your assistant can{' '}
            <strong className="text-slate-900 dark:text-white">create forms, read leads, and fetch integration snippets</strong>{' '}
            without leaving the editor.
          </p>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Endpoint</p>
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
            Tools available: <code>list_forms</code>, <code>create_form</code>, <code>get_submissions</code>, <code>get_integration_snippet</code>.
          </p>
        </div>
      </section>
    </div>
  );
}
