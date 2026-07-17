'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LogoBadge } from '@/components/Logo';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 2FA second step (active when ADMIN_2FA_EMAIL is configured server-side)
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [code, setCode] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.require2fa) {
        setChallengeId(data.challengeId);
      } else if (res.ok && data.success) {
        window.location.href = '/admin';
      } else if (res.status === 429) {
        setError('Too many attempts. Wait a minute and try again.');
      } else {
        setError(data.error || 'Incorrect password.');
      }
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !challengeId) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/admin-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, code }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        window.location.href = '/admin';
      } else {
        setError(data.error || 'Incorrect code.');
        if (/expired|sign in again/i.test(data.error || '')) {
          setChallengeId(null);
          setCode('');
        }
      }
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center justify-center text-center">
          <LogoBadge className="h-12 w-12 rounded-xl shadow-sm" />
          <h2 className="mt-6 text-2xl font-bold text-slate-900 tracking-tight">
            {challengeId ? 'Enter your code' : 'Admin access'}
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            {challengeId
              ? 'A 6-digit code was emailed to the admin address. It expires in 10 minutes.'
              : 'Enter the admin password to continue.'}
          </p>
        </div>

        {challengeId ? (
          <form className="mt-8 space-y-4" onSubmit={handleVerify}>
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-xs text-red-600 font-medium">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <label htmlFor="code" className="text-xs font-semibold text-slate-700">Verification code</label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                required
                autoFocus
                disabled={loading}
                className="py-2.5 text-center text-lg font-bold tracking-[0.5em]"
              />
            </div>
            <Button type="submit" className="w-full py-2.5 mt-2 justify-center" disabled={loading || code.length < 6}>
              {loading ? 'Verifying…' : 'Verify & sign in'}
            </Button>
            <button
              type="button"
              onClick={() => { setChallengeId(null); setCode(''); setError(''); }}
              className="w-full text-center text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              &larr; Back to password
            </button>
          </form>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={handleLogin}>
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-xs text-red-600 font-medium">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="py-2.5"
              />
            </div>

            <Button
              type="submit"
              className="w-full py-2.5 mt-2 justify-center"
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
