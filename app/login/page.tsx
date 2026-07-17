'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LogoBadge } from '@/components/Logo';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // In development environment, we want to allow standard inspectors,
  // but in production, anti-scraping will trigger instantly if DevTools open.
  // We don't import useAntiScraping directly on the login page in dev to ease debugging,
  // but it is embedded dynamically in the hook itself.

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

      if (res.ok && data.success) {
        window.location.href = '/admin';
      } else {
        setError(data.error || 'Mot de passe incorrect.');
      }
    } catch (err) {
      setError('Impossible de se connecter au serveur.');
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
            Admin access
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Enter the admin password to continue.
          </p>
        </div>

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
      </div>
    </div>
  );
}
