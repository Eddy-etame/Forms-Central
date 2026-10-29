'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from '@/lib/useLocale';
import { getAppDict } from '@/lib/appDict';

export default function PortalForgotPasswordPage() {
  const t = getAppDict(useLocale()).portal.forgot;
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/portal/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch {}
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t.title}</h1>
        <p className="mt-1.5 text-sm text-slate-500">{t.body}</p>
        {sent ? (
          <p className="mt-6 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-800">{t.sent}</p>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={submit}>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-700">{t.emailLabel}</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} placeholder="you@company.com" className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            </div>
            <button type="submit" disabled={loading} className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50">
              {loading ? t.sending : t.send}
            </button>
          </form>
        )}
        <p className="mt-6 text-center text-xs text-slate-500">
          <Link href="/portal/login" className="font-semibold text-slate-900 hover:underline">{t.back}</Link>
        </p>
      </div>
    </div>
  );
}
