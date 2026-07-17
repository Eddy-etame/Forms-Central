'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AuthShell } from '@/components/auth/AuthShell';
import { GoogleButton } from '@/components/auth/GoogleButton';
import Link from 'next/link';

export default function ClientLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 2FA second step
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [code, setCode] = useState('');

  // Surface a failed Google sign-in redirect (?error=google).
  useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('error') === 'google') {
      setError('Google sign-in failed or was cancelled. Try again or use your password.');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/client-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.require2fa) {
        setChallengeId(data.challengeId);
      } else if (res.ok && data.success) {
        window.location.href = '/client/dashboard';
      } else if (res.status === 429) {
        setError('Too many attempts. Please wait a minute and try again.');
      } else {
        setError(data.error || 'Incorrect email or password.');
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
      const res = await fetch('/api/auth/client-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, code }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        window.location.href = '/client/dashboard';
      } else {
        setError(data.error || 'Incorrect code.');
        if (/expired|sign in again/i.test(data.error || '')) {
          // Challenge is dead — send them back to the password step.
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
    <AuthShell>
      <div className="w-full max-w-sm">
        {challengeId ? (
          <>
            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Enter your code</h2>
              <p className="mt-1.5 text-sm text-slate-500">
                We emailed a 6-digit code to <strong className="text-slate-700">{email}</strong>. It expires in 10 minutes.
              </p>
            </div>

            <form className="mt-8 space-y-4" onSubmit={handleVerify}>
              {error && (
                <div role="alert" className="rounded-lg bg-red-50 border border-red-100 p-3 text-xs text-red-600 font-medium">
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
                &larr; Use a different account
              </button>
            </form>
          </>
        ) : (
        <>
        <div className="text-center lg:text-left">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Sign in to see your leads and performance.
          </p>
        </div>

        <div className="mt-8">
          <GoogleButton label="Sign in with Google" />
        </div>

        <form className="mt-4 space-y-4" onSubmit={handleLogin}>
          {error && (
            <div role="alert" className="rounded-lg bg-red-50 border border-red-100 p-3 text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-slate-700">
              Email
            </label>
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

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-xs font-semibold text-slate-700">
                Password
              </label>
              <Link href="/client/forgot-password" className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
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

          <p className="text-center text-xs text-slate-500 pt-1">
            No account yet?{' '}
            <Link href="/client/signup" className="font-semibold text-slate-900 hover:underline">
              Create one free
            </Link>
          </p>
        </form>
        </>
        )}
      </div>
    </AuthShell>
  );
}
