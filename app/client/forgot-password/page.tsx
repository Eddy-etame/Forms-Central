'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AuthShell } from '@/components/auth/AuthShell';
import { useLocale } from '@/lib/useLocale';
import { getAppDict } from '@/lib/appDict';

export default function ForgotPasswordPage() {
  const t = getAppDict(useLocale()).auth.forgotPassword;
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSent(true); // always show the same confirmation (no enumeration)
    } catch {
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="w-full max-w-sm">
        <div className="text-center lg:text-left">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t.title}</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            {sent ? t.checkInbox : t.enterEmailBody}
          </p>
        </div>

        {sent ? (
          <div className="mt-8 rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
            {t.confirmBody.split('{email}')[0]}<strong>{email}</strong>{t.confirmBody.split('{email}')[1]}
          </div>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={submit}>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-700">{t.emailLabel}</label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="py-2.5"
              />
            </div>
            <Button type="submit" className="w-full py-2.5 mt-2 justify-center" disabled={loading}>
              {loading ? t.sending : t.sendResetLink}
            </Button>
          </form>
        )}
        <p className="mt-6 text-center text-xs text-slate-500 lg:text-left">
          <Link href="/client/login" className="font-medium text-slate-600 hover:text-slate-900">{t.backToSignIn}</Link>
        </p>
      </div>
    </AuthShell>
  );
}
