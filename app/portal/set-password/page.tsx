'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLocale } from '@/lib/useLocale';
import { getAppDict } from '@/lib/appDict';

/**
 * A client opens the single-use link from the invite or reset e-mail and
 * chooses a password. The API signs them in; they land in their inbox.
 */

function SetPasswordForm() {
  const t = getAppDict(useLocale()).portal.setPassword;
  const token = useSearchParams().get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setError(t.errShort); return; }
    if (password !== confirm) { setError(t.errMismatch); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/portal/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        window.location.href = '/portal';
      } else {
        setError(data.error || t.errNetwork);
      }
    } catch {
      setError(t.errNetwork);
    } finally {
      setLoading(false);
    }
  }

  const inputCls = 'w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100';

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white shadow-sm">●</div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">{t.title}</h1>
        <p className="mt-1.5 text-sm text-slate-500">{t.subtitle}</p>
      </div>

      {!token ? (
        <div className="mt-8 space-y-4 text-center">
          <p className="rounded-lg border border-amber-100 bg-amber-50 p-3 text-xs font-medium text-amber-700">{t.missingToken}</p>
          <Link href="/portal/forgot-password" className="text-sm font-semibold text-slate-900 hover:underline">{t.askNew}</Link>
        </div>
      ) : (
        <form className="mt-8 space-y-4" onSubmit={submit}>
          {error && <div role="alert" className="rounded-lg border border-red-100 bg-red-50 p-3 text-xs font-medium text-red-600">{error}</div>}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-semibold text-slate-700">{t.passwordLabel}</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.placeholder} required minLength={8} disabled={loading} className={inputCls} autoComplete="new-password" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="confirm" className="text-xs font-semibold text-slate-700">{t.confirmLabel}</label>
            <input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder={t.placeholder} required minLength={8} disabled={loading} className={inputCls} autoComplete="new-password" />
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50">
            {loading ? t.submitting : t.submit}
          </button>
        </form>
      )}
    </div>
  );
}

export default function PortalSetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Suspense fallback={null}>
        <SetPasswordForm />
      </Suspense>
    </div>
  );
}
