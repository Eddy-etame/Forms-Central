'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AuthShell } from '@/components/auth/AuthShell';
import { GoogleButton } from '@/components/auth/GoogleButton';
import Link from 'next/link';
import { useLocale } from '@/lib/useLocale';
import { getAppDict } from '@/lib/appDict';

export default function ClientLoginPage() {
  const t = getAppDict(useLocale()).auth.clientLogin;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 2FA second step
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [code, setCode] = useState('');

  // Surface redirect reasons (?error=google, ?evicted=1).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'google') {
      setError(t.errGoogleFailed);
    } else if (params.get('evicted') === '1') {
      setError(t.errEvicted);
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
        setError(t.errTooMany);
      } else {
        setError(data.error || t.errIncorrect);
      }
    } catch {
      setError(t.errNetwork);
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
        setError(data.error || t.errIncorrectCode);
        if (/expired|sign in again/i.test(data.error || '')) {
          // Challenge is dead — send them back to the password step.
          setChallengeId(null);
          setCode('');
        }
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
        {challengeId ? (
          <>
            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t.enterCode}</h2>
              <p className="mt-1.5 text-sm text-slate-500">
                {t.codeEmailedBody.split('{email}')[0]}<strong className="text-slate-700">{email}</strong>{t.codeEmailedBody.split('{email}')[1]}
              </p>
            </div>

            <form className="mt-8 space-y-4" onSubmit={handleVerify}>
              {error && (
                <div role="alert" className="rounded-lg bg-red-50 border border-red-100 p-3 text-xs text-red-600 font-medium">
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <label htmlFor="code" className="text-xs font-semibold text-slate-700">{t.verificationCodeLabel}</label>
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
                {loading ? t.verifying : t.verifyAndSignIn}
              </Button>
              <button
                type="button"
                onClick={() => { setChallengeId(null); setCode(''); setError(''); }}
                className="w-full text-center text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                {t.useDifferentAccount}
              </button>
            </form>
          </>
        ) : (
        <>
        <div className="text-center lg:text-left">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t.welcomeBack}
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            {t.subtitle}
          </p>
        </div>

        <div className="mt-8">
          <GoogleButton label={t.googleSignIn} />
        </div>

        <form className="mt-4 space-y-4" onSubmit={handleLogin}>
          {error && (
            <div role="alert" className="rounded-lg bg-red-50 border border-red-100 p-3 text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-slate-700">
              {t.emailLabel}
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
                {t.passwordLabel}
              </label>
              <Link href="/client/forgot-password" className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors">
                {t.forgotPassword}
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
            {loading ? t.signingIn : t.signIn}
          </Button>

          <p className="text-center text-xs text-slate-500 pt-1">
            {t.noAccount}{' '}
            <Link href="/client/signup" className="font-semibold text-slate-900 hover:underline">
              {t.createOneFree}
            </Link>
          </p>
        </form>
        </>
        )}
      </div>
    </AuthShell>
  );
}
