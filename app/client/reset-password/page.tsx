'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AuthShell } from '@/components/auth/AuthShell';
import { useLocale } from '@/lib/useLocale';
import { getAppDict } from '@/lib/appDict';

function ResetForm() {
  const t = getAppDict(useLocale()).auth.resetPassword;
  const token = useSearchParams().get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) return setError(t.errTooShort);
    if (password !== confirm) return setError(t.errMismatch);

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) setDone(true);
      else setError(data.error || t.errCouldNotReset);
    } catch {
      setError(t.errNetwork);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="text-center lg:text-left">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {done ? t.passwordUpdated : t.chooseNewPassword}
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          {done ? t.canSignInNow : t.enterNewPasswordBody}
        </p>
      </div>

      {done ? (
        <Link
          href="/client/login"
          className="mt-8 flex w-full items-center justify-center rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
        >
          {t.goToSignIn}
        </Link>
      ) : !token ? (
        <div className="mt-8 rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-600">
          {t.missingTokenA}{' '}
          <Link href="/client/forgot-password" className="font-semibold underline">{t.forgotPasswordLinkText}</Link> {t.missingTokenB}
        </div>
      ) : (
        <form className="mt-8 space-y-4" onSubmit={submit}>
          {error && (
            <div role="alert" className="rounded-lg bg-red-50 border border-red-100 p-3 text-xs text-red-600 font-medium">{error}</div>
          )}
          <div className="space-y-1.5">
            <label htmlFor="pw" className="text-xs font-semibold text-slate-700">{t.newPasswordLabel}</label>
            <Input id="pw" type="password" placeholder={t.newPasswordPlaceholder} value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} className="py-2.5" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="pw2" className="text-xs font-semibold text-slate-700">{t.confirmPasswordLabel}</label>
            <Input id="pw2" type="password" placeholder={t.confirmPasswordPlaceholder} value={confirm} onChange={(e) => setConfirm(e.target.value)} required disabled={loading} className="py-2.5" />
          </div>
          <Button type="submit" className="w-full py-2.5 mt-2 justify-center" disabled={loading}>
            {loading ? t.updating : t.updatePassword}
          </Button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell>
      <Suspense fallback={<p className="text-sm text-slate-400">Loading…</p>}>
        <ResetForm />
      </Suspense>
    </AuthShell>
  );
}
