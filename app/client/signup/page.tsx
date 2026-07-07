'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function ClientSignupPage() {
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
        setError(data.error || 'Could not create the account.');
      }
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="absolute top-4 left-4">
        <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          &larr; Back to site
        </Link>
      </div>
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-lg shadow-sm">
            K
          </div>
          <h2 className="mt-6 text-2xl font-bold text-slate-900 tracking-tight">Create your account</h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Start free — one form backend for all your websites.
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSignup}>
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Name or company</label>
            <Input
              type="text"
              placeholder="Acme Studio"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="py-2.5"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Email</label>
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
            <label className="text-xs font-semibold text-slate-700">Password</label>
            <Input
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="py-2.5"
            />
          </div>

          <Button type="submit" className="w-full py-2.5 mt-2 justify-center" disabled={loading}>
            {loading ? 'Creating your account…' : 'Create account'}
          </Button>

          <p className="text-center text-xs text-slate-500 pt-1">
            Already have an account?{' '}
            <Link href="/client/login" className="font-semibold text-slate-900 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
