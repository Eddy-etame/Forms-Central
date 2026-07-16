'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AuthShell } from '@/components/auth/AuthShell';

function ResetForm() {
  const token = useSearchParams().get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    if (password !== confirm) return setError('Passwords do not match.');

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) setDone(true);
      else setError(data.error || 'Could not reset your password.');
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="text-center lg:text-left">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {done ? 'Password updated' : 'Choose a new password'}
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          {done ? 'You can now sign in with your new password.' : 'Enter a new password for your account.'}
        </p>
      </div>

      {done ? (
        <Link
          href="/client/login"
          className="mt-8 flex w-full items-center justify-center rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
        >
          Go to sign in
        </Link>
      ) : !token ? (
        <div className="mt-8 rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-600">
          This reset link is missing its token. Request a new one from the{' '}
          <Link href="/client/forgot-password" className="font-semibold underline">forgot password</Link> page.
        </div>
      ) : (
        <form className="mt-8 space-y-4" onSubmit={submit}>
          {error && (
            <div role="alert" className="rounded-lg bg-red-50 border border-red-100 p-3 text-xs text-red-600 font-medium">{error}</div>
          )}
          <div className="space-y-1.5">
            <label htmlFor="pw" className="text-xs font-semibold text-slate-700">New password</label>
            <Input id="pw" type="password" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} className="py-2.5" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="pw2" className="text-xs font-semibold text-slate-700">Confirm password</label>
            <Input id="pw2" type="password" placeholder="Re-enter password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required disabled={loading} className="py-2.5" />
          </div>
          <Button type="submit" className="w-full py-2.5 mt-2 justify-center" disabled={loading}>
            {loading ? 'Updating…' : 'Update password'}
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
