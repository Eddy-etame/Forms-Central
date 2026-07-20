'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Key, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { getClients, saveClient, deleteClient, getClientPassword, triggerPasswordReset } from '@/lib/actions';
import { toast, confirmDialog } from '@/components/ui/Toaster';
import { useLocale } from '@/lib/useLocale';
import { getAppDict } from '@/lib/appDict';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  logo_url?: string;
  primary_color?: string;
  font_family?: string;
  sender_name?: string;
  reply_to_email?: string;
  two_factor_enabled?: boolean;
  plan?: string;
  created_at: string;
}

export default function ClientsPage() {
  const t = getAppDict(useLocale()).admin.clients;
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('sans-serif');
  const [senderName, setSenderName] = useState('');
  const [replyToEmail, setReplyToEmail] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Password state: maps client ID to their decrypted password
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, string>>({});
  const [loadingPassword, setLoadingPassword] = useState<Record<string, boolean>>({});
  const [resettingPassword, setResettingPassword] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    try {
      const data = await getClients();
      setClients(data);
    } catch (err) {
      console.error('Failed to load clients:', err);
    } finally {
      setLoading(false);
    }
  }

  const openCreateModal = () => {
    setEditClient(null);
    setName('');
    setEmail('');
    setPhone('');
    setLogoUrl('');
    setPrimaryColor('#000000');
    setFontFamily('sans-serif');
    setSenderName('');
    setReplyToEmail('');
    setTwoFactorEnabled(false);
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditClient(client);
    setName(client.name);
    setEmail(client.email);
    setPhone(client.phone || '');
    setLogoUrl(client.logo_url || '');
    setPrimaryColor(client.primary_color || '#000000');
    setFontFamily(client.font_family || 'sans-serif');
    setSenderName(client.sender_name || '');
    setReplyToEmail(client.reply_to_email || '');
    setTwoFactorEnabled(!!client.two_factor_enabled);
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setFormError(t.requiredErr);
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const res = await saveClient(
        editClient ? editClient.id : null,
        name,
        email,
        phone,
        logoUrl || null,
        primaryColor || '#000000',
        fontFamily || 'sans-serif',
        senderName || null,
        replyToEmail || null,
        twoFactorEnabled
      );
      if (res && !res.success) {
        setFormError(res.error || t.saveErr);
        return;
      }
      await loadClients();
      setModalOpen(false);
    } catch (err: any) {
      console.error('Error saving client:', err);
      setFormError(err.message || t.saveErr);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmDialog({
      title: t.deleteConfirmTitle,
      body: t.deleteConfirmBody,
      confirmLabel: t.deleteConfirmBtn,
      danger: true,
    });
    if (!ok) return;

    try {
      const res = await deleteClient(id);
      if (res && !res.success) {
        toast.error(res.error || t.deleteErr);
        return;
      }
      toast.success(t.deletedOk);
      await loadClients();
    } catch (err) {
      console.error('Error deleting client:', err);
      toast.error(t.deleteErr);
    }
  };

  const handleTogglePassword = async (id: string) => {
    if (visiblePasswords[id]) {
      // Hide password
      setVisiblePasswords(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      return;
    }

    // Fetch password
    setLoadingPassword(prev => ({ ...prev, [id]: true }));
    try {
      const res = await getClientPassword(id);
      if (res.success && res.password) {
        setVisiblePasswords(prev => ({ ...prev, [id]: res.password }));
      } else {
        toast.error(res.error || t.passwordErr);
      }
    } catch (err) {
      console.error(err);
      toast.error(t.networkErr);
    } finally {
      setLoadingPassword(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleResetPassword = async (id: string) => {
    const ok = await confirmDialog({
      title: t.resetConfirmTitle,
      body: t.resetConfirmBody,
      confirmLabel: t.resetConfirmBtn,
    });
    if (!ok) return;

    setResettingPassword(prev => ({ ...prev, [id]: true }));
    try {
      const res = await triggerPasswordReset(id);
      if (res.success) {
        toast.success(t.resetOk);
        // Hide password if it was visible, as it's no longer valid
        setVisiblePasswords(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      } else {
        toast.error(res.error || t.resetErr);
      }
    } catch (err) {
      console.error(err);
      toast.error(t.networkErr);
    } finally {
      setResettingPassword(prev => ({ ...prev, [id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t.title}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t.subtitle}</p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white font-medium hover:bg-slate-800 rounded-lg">
          <Plus className="h-4 w-4" /> {t.newClient}
        </Button>
      </div>

      {/* Grid of clients cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {clients.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <span className="text-sm font-medium text-slate-400">{t.noClients}</span>
          </div>
        ) : (
          clients.map((client) => (
            <div key={client.id} className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-xs flex flex-col justify-between min-h-[14rem]">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {client.logo_url ? (
                    <img src={client.logo_url} alt="Logo" className="h-8 w-8 object-contain rounded" />
                  ) : (
                    <div 
                      className="h-8 w-8 rounded flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: client.primary_color || '#000000' }}
                    >
                      {client.name.charAt(0)}
                    </div>
                  )}
                  <h3 className="font-bold text-slate-900 dark:text-white text-base truncate">{client.name}</h3>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 truncate">{client.email}</p>
                {client.phone && <p className="text-xs text-slate-400 mt-1 font-medium">{client.phone}</p>}

                {/* Password Section */}
                <div className="mt-4 flex items-center justify-between border border-slate-100 dark:border-slate-800 rounded-lg p-2 bg-slate-50">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Key className="h-4 w-4 text-slate-400" />
                    {visiblePasswords[client.id] ? (
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white bg-white px-2 py-1 rounded border border-slate-200">
                        {visiblePasswords[client.id]}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">••••••••</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      onClick={() => handleTogglePassword(client.id)}
                      disabled={loadingPassword[client.id]}
                      className="h-7 px-2 text-[10px] uppercase font-bold tracking-wider text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                      {loadingPassword[client.id] ? "..." : visiblePasswords[client.id] ? t.hide : t.show}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleResetPassword(client.id)}
                      disabled={resettingPassword[client.id]}
                      title={t.resetPasswordTitle}
                      className="h-7 w-7 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${resettingPassword[client.id] ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 border-t border-slate-50 pt-4">
                <Button 
                  variant="ghost" 
                  onClick={() => openEditModal(client)}
                  className="px-2 py-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs gap-1"
                >
                  <Edit2 className="h-3.5 w-3.5" /> {t.edit}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleDelete(client.id)}
                  className="px-2 py-1.5 text-red-500 hover:bg-red-50 text-xs gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" /> {t.delete}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editClient ? t.editModalTitle : t.createModalTitle}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-xs text-red-600 font-medium">
              {formError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.clientNameLabel}</label>
            <Input
              type="text"
              placeholder={t.clientNamePlaceholder}
              value={name}
              onChange={e => setName(e.target.value)}
              required
              disabled={saving}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.emailLabel}</label>
            <Input
              type="email"
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={saving}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.phoneLabel}</label>
            <Input
              type="text"
              placeholder={t.phonePlaceholder}
              value={phone}
              onChange={e => setPhone(e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">{t.artDirectionTitle}</h4>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.logoUrlLabel}</label>
                <Input
                  type="url"
                  placeholder={t.logoUrlPlaceholder}
                  value={logoUrl}
                  onChange={e => setLogoUrl(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.primaryColorLabel}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={e => setPrimaryColor(e.target.value)}
                      disabled={saving}
                      className="h-9 w-12 cursor-pointer rounded bg-transparent border-0 p-0"
                    />
                    <Input
                      type="text"
                      value={primaryColor}
                      onChange={e => setPrimaryColor(e.target.value)}
                      placeholder="#000000"
                      disabled={saving}
                      className="font-mono text-xs uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.fontFamilyLabel}</label>
                  <select
                    value={fontFamily}
                    onChange={e => setFontFamily(e.target.value)}
                    disabled={saving}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="sans-serif">{t.fontSans}</option>
                    <option value="serif">{t.fontSerif}</option>
                    <option value="monospace">{t.fontMono}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t.customSenderTitle}</h4>
              <span className="rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">{t.paidBadge}</span>
            </div>
            <p className="mb-4 text-xs text-slate-500">
              {t.customSenderDescA} <code className="rounded bg-slate-100 dark:bg-slate-800 px-1">From</code> {t.customSenderDescC}
            </p>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.senderNameLabel}</label>
                <Input
                  type="text"
                  placeholder={t.senderNamePlaceholder}
                  value={senderName}
                  onChange={e => setSenderName(e.target.value)}
                  disabled={saving}
                />
                <p className="text-[11px] text-slate-400">{t.senderNameHint}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t.replyToLabel}</label>
                <Input
                  type="email"
                  placeholder={t.replyToPlaceholder}
                  value={replyToEmail}
                  onChange={e => setReplyToEmail(e.target.value)}
                  disabled={saving}
                />
                <p className="text-[11px] text-slate-400">{t.replyToHint}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">{t.securityTitle}</h4>
            <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <input
                type="checkbox"
                checked={twoFactorEnabled}
                onChange={e => setTwoFactorEnabled(e.target.checked)}
                disabled={saving}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
              />
              <span>
                <span className="block text-sm font-semibold text-slate-800 dark:text-slate-200">{t.twoFactorLabel}</span>
                <span className="block text-[11px] text-slate-500">
                  {t.twoFactorHint.replace('{email}', email || t.theirAddress)}
                </span>
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)} disabled={saving}>
              {t.cancel}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? t.saving : t.save}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
