'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Key, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { getClients, saveClient, deleteClient, getClientPassword, triggerPasswordReset } from '@/lib/actions';
import { toast, confirmDialog } from '@/components/ui/Toaster';

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
      setFormError('Nom et email requis.');
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
        setFormError(res.error || 'Impossible de sauvegarder le client.');
        return;
      }
      await loadClients();
      setModalOpen(false);
    } catch (err: any) {
      console.error('Error saving client:', err);
      setFormError(err.message || 'Impossible de sauvegarder le client.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmDialog({
      title: 'Delete this client?',
      body: 'This permanently deletes the client and every form they own. Their leads stay in the database but lose their owner.',
      confirmLabel: 'Delete client',
      danger: true,
    });
    if (!ok) return;

    try {
      const res = await deleteClient(id);
      if (res && !res.success) {
        toast.error(res.error || 'Could not delete the client.');
        return;
      }
      toast.success('Client deleted.');
      await loadClients();
    } catch (err) {
      console.error('Error deleting client:', err);
      toast.error('Could not delete the client.');
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
        toast.error(res.error || 'Could not retrieve the password.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error.');
    } finally {
      setLoadingPassword(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleResetPassword = async (id: string) => {
    const ok = await confirmDialog({
      title: 'Reset this client’s password?',
      body: 'A new temporary password is generated and emailed to the client. Their current password stops working immediately.',
      confirmLabel: 'Reset & email',
    });
    if (!ok) return;

    setResettingPassword(prev => ({ ...prev, [id]: true }));
    try {
      const res = await triggerPasswordReset(id);
      if (res.success) {
        toast.success('Password reset and emailed to the client.');
        // Hide password if it was visible, as it's no longer valid
        setVisiblePasswords(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      } else {
        toast.error(res.error || 'Could not reset the password.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error.');
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
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Clients</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage the recipients who get form notifications.</p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white font-medium hover:bg-slate-800 rounded-lg">
          <Plus className="h-4 w-4" /> New client
        </Button>
      </div>

      {/* Grid of clients cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {clients.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <span className="text-sm font-medium text-slate-400">No clients yet.</span>
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
                      className="h-7 px-2 text-[10px] uppercase font-bold tracking-wider text-slate-500 hover:text-slate-900"
                    >
                      {loadingPassword[client.id] ? "..." : visiblePasswords[client.id] ? "Cacher" : "Voir"}
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => handleResetPassword(client.id)}
                      disabled={resettingPassword[client.id]}
                      title="Reset password"
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
                  className="px-2 py-1.5 text-slate-500 hover:text-slate-900 text-xs gap-1"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => handleDelete(client.id)}
                  className="px-2 py-1.5 text-red-500 hover:bg-red-50 text-xs gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
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
        title={editClient ? "Edit client" : "Create a client"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-xs text-red-600 font-medium">
              {formError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Client name</label>
            <Input 
              type="text" 
              placeholder="e.g. Acme Corp" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required
              disabled={saving}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Adresse Email</label>
            <Input 
              type="email" 
              placeholder="e.g. contact@acme.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required
              disabled={saving}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone number (SMS)</label>
            <Input 
              type="text" 
              placeholder="e.g. +1 555 123 4567" 
              value={phone} 
              onChange={e => setPhone(e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Direction Artistique (Emails)</h4>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">URL du Logo</label>
                <Input 
                  type="url" 
                  placeholder="https://.../logo.png" 
                  value={logoUrl} 
                  onChange={e => setLogoUrl(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Primary color</label>
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
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Font family</label>
                  <select
                    value={fontFamily}
                    onChange={e => setFontFamily(e.target.value)}
                    disabled={saving}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="sans-serif">Sans-serif (default)</option>
                    <option value="serif">Serif (Classique)</option>
                    <option value="monospace">Monospace (Code)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Custom sender</h4>
              <span className="rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Paid</span>
            </div>
            <p className="mb-4 text-xs text-slate-500">
              How this client&apos;s brand appears on the confirmation emails their customers receive. Applied only on paid plans.
              A true custom <code className="rounded bg-slate-100 dark:bg-slate-800 px-1">From</code> address activates once the client&apos;s domain is verified.
            </p>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Sender display name</label>
                <Input
                  type="text"
                  placeholder="e.g. Shu"
                  value={senderName}
                  onChange={e => setSenderName(e.target.value)}
                  disabled={saving}
                />
                <p className="text-[11px] text-slate-400">Shown as the sender name. Falls back to the client name if empty.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Reply-to address</label>
                <Input
                  type="email"
                  placeholder="e.g. contact@shu.com"
                  value={replyToEmail}
                  onChange={e => setReplyToEmail(e.target.value)}
                  disabled={saving}
                />
                <p className="text-[11px] text-slate-400">Replies from their customers go here. Works today — no domain needed.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Security</h4>
            <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <input
                type="checkbox"
                checked={twoFactorEnabled}
                onChange={e => setTwoFactorEnabled(e.target.checked)}
                disabled={saving}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
              />
              <span>
                <span className="block text-sm font-semibold text-slate-800 dark:text-slate-200">Require two-factor sign-in</span>
                <span className="block text-[11px] text-slate-500">
                  After their password, this client must enter a 6-digit code emailed to {email || 'their address'}.
                </span>
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)} disabled={saving}>
              Annuler
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
