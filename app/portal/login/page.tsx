'use client';

import { useState } from 'react';

export default function PortalLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/portal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        window.location.href = '/portal';
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-lg shadow-sm">
            ●
          </div>
          <h1 className="mt-6 text-2xl font-bold text-slate-900 tracking-tight">Client portal</h1>
          <p className="mt-1.5 text-sm text-slate-500">Sign in to view your leads.</p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleLogin}>
          {error && (
            <div role="alert" className="rounded-lg bg-red-50 border border-red-100 p-3 text-xs text-red-600 font-medium">
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-slate-700">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-semibold text-slate-700">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
