'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings2, Code2, Trash2 } from 'lucide-react';
import { toast, confirmDialog } from '@/components/ui/Toaster';
import type { AppDict } from '@/lib/appDict';
import SnippetTabs from './SnippetTabs';

/**
 * Everything a developer configures on a form, in their own dashboard:
 * the client that receives the leads, the sites allowed to post, the visitor
 * auto-reply, the success page, the webhook, the developer copy, on/off —
 * plus the integration code for every stack.
 */

type Dict = AppDict['formPage']['settings'];
type SnDict = AppDict['snippets'];
type ClientLite = { id: string; name: string; email: string; lang: 'fr' | 'en' };
type FormData = {
  id: string; name: string; is_active: boolean; allowed_origins: string[]; notify_email: boolean;
  auto_reply_enabled: boolean; auto_reply_subject: string | null; auto_reply_message: string | null;
  success_url: string | null; webhook_url: string | null; portal_user_id: string;
  portal_users: { id: string; name: string; email: string; lang: string | null } | null;
};

const inputCls = 'w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500';
const labelCls = 'text-xs font-semibold text-slate-700 dark:text-slate-300';
const hintCls = 'text-[11px] text-slate-500 dark:text-slate-400';

export default function FormSettings({ formId, t, sn }: { formId: string; t: Dict; sn: SnDict }) {
  const router = useRouter();
  const [form, setForm] = useState<FormData | null>(null);
  const [clients, setClients] = useState<ClientLite[]>([]);
  const [draft, setDraft] = useState({ name: '', clientId: '', origins: '', successUrl: '', webhookUrl: '', autoReply: true, subject: '', message: '', notifyDeveloper: true, isActive: true });
  const [saving, setSaving] = useState(false);
  const apiUrl = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    Promise.all([
      fetch(`/api/developer/forms/${formId}`).then((r) => r.json()),
      fetch('/api/developer/clients').then((r) => r.json()),
    ]).then(([f, c]) => {
      if (f?.success) {
        const fm: FormData = f.form;
        setForm(fm);
        setDraft({
          name: fm.name,
          clientId: fm.portal_user_id,
          origins: (fm.allowed_origins || []).join('\n'),
          successUrl: fm.success_url || '',
          webhookUrl: fm.webhook_url || '',
          autoReply: fm.auto_reply_enabled,
          subject: fm.auto_reply_subject || '',
          message: fm.auto_reply_message || '',
          notifyDeveloper: fm.notify_email,
          isActive: fm.is_active,
        });
      }
      if (c?.success) setClients(c.clients);
    }).catch(() => {});
  }, [formId]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/developer/forms/${formId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: draft.name,
          clientId: draft.clientId,
          origins: draft.origins.split(/\n|,/).map((s) => s.trim()).filter(Boolean),
          successUrl: draft.successUrl,
          webhookUrl: draft.webhookUrl,
          autoReply: { enabled: draft.autoReply, subject: draft.subject, message: draft.message },
          notifyDeveloper: draft.notifyDeveloper,
          isActive: draft.isActive,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setForm(data.form);
        toast.success(t.saved);
        router.refresh();
      } else {
        toast.error(data.error || t.saveErr);
      }
    } catch {
      toast.error(t.saveErr);
    } finally {
      setSaving(false);
    }
  }

  async function destroy() {
    const ok = await confirmDialog({ title: t.deleteTitle, body: t.deleteBody, confirmLabel: t.deleteBtn, cancelLabel: t.cancel, danger: true });
    if (!ok) return;
    const res = await fetch(`/api/developer/forms/${formId}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok && data.success) {
      router.push('/developer/dashboard');
      router.refresh();
    } else {
      toast.error(data.error || t.deleteErr);
    }
  }

  if (!form) return <p className="text-sm text-slate-400">{t.loading}</p>;

  const client = clients.find((c) => c.id === draft.clientId) || (form.portal_users ? { id: form.portal_users.id, name: form.portal_users.name, email: form.portal_users.email, lang: (form.portal_users.lang === 'en' ? 'en' : 'fr') as 'fr' | 'en' } : null);
  const lang: 'fr' | 'en' = client?.lang === 'en' ? 'en' : 'fr';

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <form onSubmit={save} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
        <div className="flex items-center gap-2.5">
          <Settings2 className="h-4 w-4 text-slate-500" />
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">{t.title}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.subtitle}</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className={labelCls}>{t.nameLabel}</label>
          <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} maxLength={60} className={inputCls} />
        </div>

        <div className="space-y-1.5">
          <label className={labelCls}>{t.clientLabel}</label>
          <select value={draft.clientId} onChange={(e) => setDraft({ ...draft, clientId: e.target.value })} className={inputCls}>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.email}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className={labelCls}>{t.originsLabel}</label>
          <textarea value={draft.origins} onChange={(e) => setDraft({ ...draft, origins: e.target.value })} rows={3} className={`${inputCls} font-mono text-xs`} />
          <p className={hintCls}>{t.originsHint}</p>
        </div>

        <div className="space-y-1.5">
          <label className={labelCls}>{t.successUrlLabel}</label>
          <input value={draft.successUrl} onChange={(e) => setDraft({ ...draft, successUrl: e.target.value })} placeholder="https://acme.com/merci" className={inputCls} />
          <p className={hintCls}>{t.successUrlHint}</p>
        </div>

        <div className="space-y-1.5">
          <label className={labelCls}>{t.webhookLabel}</label>
          <input value={draft.webhookUrl} onChange={(e) => setDraft({ ...draft, webhookUrl: e.target.value })} placeholder="https://api.yourapp.com/hooks/inlet" className={inputCls} />
          <p className={hintCls}>{t.webhookHint}</p>
        </div>

        <div className="space-y-3 rounded-xl border border-slate-100 p-4 dark:border-slate-800">
          <label className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input type="checkbox" checked={draft.autoReply} onChange={(e) => setDraft({ ...draft, autoReply: e.target.checked })} className="mt-0.5 h-4 w-4 rounded border-slate-300" />
            <span><strong>{t.autoReplyLabel}</strong><br /><span className={hintCls}>{t.autoReplyHint}</span></span>
          </label>
          {draft.autoReply && (
            <>
              <div className="space-y-1.5">
                <label className={labelCls}>{t.subjectLabel}</label>
                <input value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} maxLength={150} className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>{t.messageLabel}</label>
                <textarea value={draft.message} onChange={(e) => setDraft({ ...draft, message: e.target.value })} rows={4} maxLength={4000} className={inputCls} />
                <p className={hintCls}>{t.messageHint}</p>
              </div>
            </>
          )}
        </div>

        <label className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
          <input type="checkbox" checked={draft.notifyDeveloper} onChange={(e) => setDraft({ ...draft, notifyDeveloper: e.target.checked })} className="mt-0.5 h-4 w-4 rounded border-slate-300" />
          <span><strong>{t.developerCopyLabel}</strong><br /><span className={hintCls}>{t.developerCopyHint}</span></span>
        </label>

        <label className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
          <input type="checkbox" checked={draft.isActive} onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })} className="mt-0.5 h-4 w-4 rounded border-slate-300" />
          <span><strong>{t.activeLabel}</strong><br /><span className={hintCls}>{t.activeHint}</span></span>
        </label>

        <div className="flex items-center justify-between gap-3 pt-2">
          <button type="submit" disabled={saving} className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-950">
            {saving ? t.saving : t.save}
          </button>
          <button type="button" onClick={destroy} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50">
            <Trash2 className="h-3.5 w-3.5" /> {t.deleteBtn}
          </button>
        </div>
      </form>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-3">
        <div className="flex items-center gap-2.5">
          <Code2 className="h-4 w-4 text-slate-500" />
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">{t.integrationTitle}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.integrationSubtitle}{client ? ` ${t.leadsGoTo} ${client.name} (${client.email}).` : ''}
            </p>
          </div>
        </div>
        <SnippetTabs input={{ apiUrl, formId: form.id, lang, successUrl: draft.successUrl || null, clientName: client?.name ?? null }} labels={sn} />
      </section>
    </div>
  );
}
