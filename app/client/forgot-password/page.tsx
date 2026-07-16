'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AuthShell } from '@/components/auth/AuthShell';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSent(true); // always show the same confirmation (no enumeration)
    } catch {
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="w-full max-w-sm">
        <div className="text-center lg:text-left">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reset your password</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            {sent ? 'Check your inbox.' : "Enter your email and we'll send a reset link."}
          </p>
        </div>

        {sent ? (
          <div className="mt-8 rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
            If an account exists for <strong>{email}</strong>, a reset link is on its way. The link expires in 1 hour.
          </div>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={submit}>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-700">Email</label>
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
            <Button type="submit" className="w-full py-2.5 mt-2 justify-center" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </Button>
          </form>
        )}
        <p className="mt-6 text-center text-xs text-slate-500 lg:text-left">
          <Link href="/client/login" className="font-medium text-slate-600 hover:text-slate-900">&larr; Back to sign in</Link>
        </p>
      </div>
    </AuthShell>
  );
}
