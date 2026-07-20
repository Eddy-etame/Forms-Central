'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Copy, Check, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { getFormDetails, toggleFormStatus, updateFormOrigins } from '@/lib/actions';
import { toast } from '@/components/ui/Toaster';
import { BorderBeam } from '@/components/magicui/border-beam';
import ShimmerButton from '@/components/magicui/shimmer-button';
import BlurFade from '@/components/magicui/blur-fade';
import { useLocale } from '@/lib/useLocale';
import { getAppDict } from '@/lib/appDict';


interface Submission {
  id: string;
  payload: Record<string, string>;
  ip_address: string;
  created_at: string;
}

interface Form {
  id: string;
  name: string;
  is_active: boolean;
  allowed_origins: string[];
  auto_reply_enabled: boolean;
  auto_reply_subject?: string;
  auto_reply_message?: string;
  success_url?: string;
  webhook_url?: string;
  clients: {
    name: string;
    email: string;
  };
}

export default function FormDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const t = getAppDict(useLocale()).admin.formDetail;
  const { id: formId } = use(params);
  
  const [form, setForm] = useState<Form | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [autoReplySubject, setAutoReplySubject] = useState('');
  const [autoReplyMessage, setAutoReplyMessage] = useState('');
  const [successUrl, setSuccessUrl] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [updatingSettings, setUpdatingSettings] = useState(false);

  // CORS state
  const [corsInput, setCorsInput] = useState('');
  const [updatingCors, setUpdatingCors] = useState(false);

  useEffect(() => {
    loadFormAndSubmissions();
  }, [formId]);

  async function loadFormAndSubmissions() {
    try {
      const data = await getFormDetails(formId);
      const fetchedForm = data.form as unknown as Form;
      setForm(fetchedForm);
      setSubmissions(data.submissions || []);
      if (fetchedForm) {
        setAutoReplyEnabled(fetchedForm.auto_reply_enabled || false);
        setAutoReplySubject(fetchedForm.auto_reply_subject || 'We received your message');
        setAutoReplyMessage(fetchedForm.auto_reply_message || '');
        setSuccessUrl(fetchedForm.success_url || '');
        setWebhookUrl(fetchedForm.webhook_url || '');
        setCorsInput((fetchedForm.allowed_origins || ['*']).join(', '));
      }
    } catch (err) {
      console.error('Failed to load form details:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleToggleStatus = async () => {
    if (!form) return;
    try {
      const newStatus = !form.is_active;
      const res = await toggleFormStatus(form.id, newStatus);
      if (res && !res.success) {
        toast.error(res.error || t.updateErr);
        return;
      }
      toast.success(newStatus ? t.activatedOk : t.pausedOk);
      setForm({ ...form, is_active: newStatus });
    } catch (err) {
      console.error('Failed to toggle form status:', err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    setUpdatingSettings(true);
    try {
      const { updateFormSettings } = await import('@/lib/actions');
      const res = await updateFormSettings(form.id, autoReplyEnabled, autoReplySubject, autoReplyMessage, successUrl, webhookUrl);
      if (res && !res.success) {
        toast.error(res.error || t.settingsErr);
        return;
      }
      setForm({ ...form, auto_reply_enabled: autoReplyEnabled, auto_reply_subject: autoReplySubject, auto_reply_message: autoReplyMessage, success_url: successUrl, webhook_url: webhookUrl });
      toast.success(t.settingsOk);
    } catch (err: any) {
      console.error('Error updating form settings:', err);
      toast.error(err.message || t.settingsErr);
    } finally {
      setUpdatingSettings(false);
    }
  };

  const handleSaveCors = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    setUpdatingCors(true);
    try {
      const newOrigins = corsInput.split(',').map(o => o.trim()).filter(o => o);
      const res = await updateFormOrigins(form.id, newOrigins);
      if (res && !res.success) {
        toast.error(res.error || t.corsErr);
        return;
      }
      setForm({
        ...form,
        allowed_origins: newOrigins.length > 0 ? newOrigins : ['*']
      });
      toast.success(t.corsOk);
    } catch (err: any) {
      console.error('Error updating CORS:', err);
      toast.error(err.message || t.corsErr);
    } finally {
      setUpdatingCors(false);
    }
  };

  const copyEndpoint = () => {
    if (!form) return;
    const url = `${window.location.origin}/api/submit/${form.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{t.notFoundTitle}</h3>
        <Link href="/admin/forms" className="text-sm text-slate-600 underline mt-2 block">
          {t.backToList}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link
        href="/admin/forms"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> {t.backToForms}
      </Link>

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{form.name}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.recipientClient} <span className="font-semibold text-slate-700 dark:text-slate-300">{form.clients?.name}</span> ({form.clients?.email})
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ShimmerButton
            onClick={handleToggleStatus}
            className="text-xs py-2 px-4 shadow-sm"
            background={form.is_active ? '#64748b' : '#0f172a'}
          >
            {form.is_active ? t.deactivate : t.activate}
          </ShimmerButton>
        </div>
      </div>

      {/* Grid containing details and code snippets */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left column: integration code */}
        <div className="lg:col-span-1 space-y-6">
          <BlurFade delay={0.1}>
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-xs space-y-4 relative overflow-hidden group">
            <BorderBeam size={250} duration={12} delay={9} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" colorFrom="#0ea5e9" colorTo="#3b82f6" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm relative z-10">{t.directIntegrationTitle}</h3>
            <p className="text-xs text-slate-500 relative z-10">
              {t.directIntegrationDesc}
            </p>

            <div className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 p-2 text-xs font-mono text-slate-600 select-all overflow-x-auto">
              <span className="truncate">{window.location.origin}/api/submit/{form.id}</span>
              <button
                onClick={copyEndpoint}
                className="ml-auto rounded-md p-1 hover:bg-slate-200 transition-colors text-slate-500"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">{t.htmlExampleLabel}</span>
              <pre className="rounded-lg bg-slate-950 p-3 text-[10px] text-slate-300 font-mono overflow-x-auto leading-relaxed">
{`<form action="${window.location.origin}/api/submit/${form.id}" method="POST">
  <!-- Honeypot invisible -->
  <input type="text" name="_gotcha" style="display:none" tabindex="-1" />
  
  <input type="email" name="email" required />
  <textarea name="message" required></textarea>
  <button type="submit">Send</button>
</form>`}
              </pre>
            </div>
          </div>
          </BlurFade>

          {/* Auto-Reply panel */}
          <BlurFade delay={0.15}>
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t.advancedSettingsTitle}</h3>
            <p className="text-xs text-slate-500">
              {t.advancedSettingsDesc}
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-5 pt-2">
              <div className="space-y-1.5 border-b border-slate-50 pb-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {t.redirectUrlLabel}
                </label>
                <input
                  type="text"
                  placeholder={t.redirectUrlPlaceholder}
                  value={successUrl}
                  onChange={(e) => setSuccessUrl(e.target.value)}
                  disabled={updatingSettings}
                  className="flex w-full rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 disabled:opacity-50"
                />
                <span className="text-[9px] text-slate-400 block font-medium">
                  {t.redirectUrlHint}
                </span>
              </div>

              <div className="space-y-1.5 border-b border-slate-50 pb-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {t.webhookUrlLabel}
                </label>
                <input
                  type="text"
                  placeholder={t.webhookUrlPlaceholder}
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  disabled={updatingSettings}
                  className="flex w-full rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 disabled:opacity-50"
                />
                <span className="text-[9px] text-slate-400 block font-medium">
                  {t.webhookUrlHint}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">{t.enableAutoReply}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">{t.enableAutoReplyHint}</p>
                </div>
                <input
                  id="detail-auto-reply"
                  type="checkbox"
                  checked={autoReplyEnabled}
                  onChange={(e) => setAutoReplyEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  disabled={updatingSettings}
                />
              </div>

              {autoReplyEnabled && (
                <div className="space-y-3 pt-1 border-t border-slate-50">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {t.subjectLabel}
                    </label>
                    <input
                      type="text"
                      placeholder={t.subjectPlaceholder}
                      value={autoReplySubject}
                      onChange={(e) => setAutoReplySubject(e.target.value)}
                      disabled={updatingSettings}
                      className="flex w-full rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 disabled:opacity-50"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {t.messageLabel}
                    </label>
                    <textarea
                      placeholder={t.messagePlaceholder}
                      value={autoReplyMessage}
                      onChange={(e) => setAutoReplyMessage(e.target.value)}
                      disabled={updatingSettings}
                      rows={4}
                      className="flex w-full rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 disabled:opacity-50"
                    />
                    <span className="text-[9px] text-slate-500 block font-medium">
                      {t.messageHintA} <code className="bg-slate-100 dark:bg-slate-800 text-slate-700 px-1 py-0.5 rounded text-[8px] font-mono">{"{{name}}"}</code> {t.messageHintB} <code className="bg-slate-100 dark:bg-slate-800 text-slate-700 px-1 py-0.5 rounded text-[8px] font-mono">{"{{nom}}"}</code> {t.messageHintC}
                    </span>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={updatingSettings}
                className="w-full text-xs py-2 mt-2"
              >
                {updatingSettings ? t.saving : t.saveSettings}
              </Button>
            </form>
          </div>
          </BlurFade>

          <BlurFade delay={0.2}>
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t.corsTitle}</h3>
            <p className="text-xs text-slate-500">
              {t.corsDesc}
            </p>

            <form onSubmit={handleSaveCors} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <input
                  type="text"
                  placeholder={t.corsPlaceholder}
                  value={corsInput}
                  onChange={(e) => setCorsInput(e.target.value)}
                  disabled={updatingCors}
                  className="flex w-full rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 disabled:opacity-50"
                  required
                />
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {form.allowed_origins.map((origin) => (
                  <span
                    key={origin}
                    className="inline-block text-[10px] font-mono font-medium bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-slate-600 px-2 py-0.5 rounded-md"
                  >
                    {origin}
                  </span>
                ))}
              </div>

              <Button
                type="submit"
                disabled={updatingCors}
                className="w-full text-xs py-2"
              >
                {updatingCors ? t.saving : t.updateCors}
              </Button>
            </form>
          </div>
          </BlurFade>
        </div>

        {/* Right column: Form leads list */}
        <div className="lg:col-span-2 space-y-6">
          <BlurFade delay={0.25}>
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-6">{t.leadsReceived.replace('{n}', String(submissions.length))}</h3>

            {submissions.length === 0 ? (
              <div className="py-12 text-center">
                <span className="text-sm font-medium text-slate-400">{t.noSubmissions}</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm text-slate-500 dark:text-slate-400">
                  <thead className="bg-slate-50 dark:bg-slate-950/60 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">{t.colDate}</th>
                      <th className="px-4 py-3">{t.colIp}</th>
                      <th className="px-4 py-3">{t.colPreview}</th>
                      <th className="px-4 py-3 text-right">{t.colAction}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {submissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/50 dark:bg-slate-900/60 transition-colors">
                        <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                          {new Date(sub.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs">{sub.ip_address}</td>
                        <td className="px-4 py-3.5 max-w-[200px] truncate text-xs font-medium text-slate-700 dark:text-slate-300">
                          {Object.entries(sub.payload)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(', ')}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => setSelectedSub(sub)}
                            className="inline-flex items-center gap-1 text-xs text-slate-900 dark:text-white font-semibold hover:opacity-85"
                          >
                            <Eye className="h-3.5 w-3.5" /> {t.details}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          </BlurFade>
        </div>
      </div>

      {/* Selected submission detail modal */}
      {selectedSub && (
        <Modal
          isOpen={!!selectedSub}
          onClose={() => setSelectedSub(null)}
          title={t.submissionDetailsTitle}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-xs border-b border-slate-100 dark:border-slate-800 pb-3 text-slate-400 font-medium">
              <div>
                {t.dateLabel} <span className="text-slate-800 font-semibold">{new Date(selectedSub.created_at).toLocaleString()}</span>
              </div>
              <div className="text-right">
                {t.ipLabel} <span className="text-slate-800 font-mono font-semibold">{selectedSub.ip_address}</span>
              </div>
            </div>

            <div className="space-y-3 mt-4 max-h-96 overflow-y-auto pr-2">
              {Object.entries(selectedSub.payload).map(([key, val]) => (
                <div key={key} className="space-y-1 bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 p-2.5 rounded-lg">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">{key}</span>
                  <p className="text-xs text-slate-800 font-medium whitespace-pre-wrap">{val}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
              <Button onClick={() => setSelectedSub(null)}>{t.close}</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
