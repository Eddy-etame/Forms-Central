'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AuthShell } from '@/components/auth/AuthShell';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { useLocale } from '@/lib/useLocale';
import { getAppDict } from '@/lib/appDict';

export default function ClientSignupPage() {
  const t = getAppDict(useLocale()).auth.clientSignup;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/client-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        window.location.href = '/client/dashboard';
      } else {
        setError(data.error || t.errCouldNotCreate);
      }
    } catch {
      setError(t.errNetwork);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="w-full max-w-sm">
        <div className="text-center lg:text-left">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t.title}</h2>
          <p className="mt-1.5 text-sm text-slate-500">
            {t.subtitle}
          </p>
        </div>

        <div className="mt-8">
          <GoogleButton label={t.googleSignUp} />
        </div>

        <form className="mt-4 space-y-4" onSubmit={handleSignup}>
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">{t.nameLabel}</label>
            <Input
              type="text"
              placeholder={t.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="py-2.5"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">{t.emailLabel}</label>
            <Input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="py-2.5"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">{t.passwordLabel}</label>
            <Input
              type="password"
              placeholder={t.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="py-2.5"
            />
          </div>

          <Button type="submit" className="w-full py-2.5 mt-2 justify-center" disabled={loading}>
            {loading ? t.creating : t.createAccount}
          </Button>

          <p className="text-center text-xs text-slate-500 pt-1">
            {t.alreadyHave}{' '}
            <Link href="/client/login" className="font-semibold text-slate-900 hover:underline">
              {t.signIn}
            </Link>
          </p>
        </form>
      </div>
    </AuthShell>
  );
}
