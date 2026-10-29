'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import type { AppDict } from '@/lib/appDict';

/**
 * Paid-plan CTA. Signed-in developers send a plan request (recorded in the
 * database, e-mailed to the operator). Visitors are sent to sign up first.
 * No mailto: to anyone's personal mailbox (court order A5).
 */
type UpDict = AppDict['upgrade'];

export default function UpgradeButton({ plan, planName, label, signedIn, t, className, requested = false }: {
  plan: 'solo' | 'pro' | 'max';
  planName: string;
  label: string;
  signedIn: boolean;
  t: UpDict;
  className: string;
  requested?: boolean;
}) {
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>(requested ? 'done' : 'idle');

  if (!signedIn) {
    return (
      <Link href={`/developer/signup?plan=${plan}`} className={className}>
        {label} <ArrowRight className="cta-arrow h-4 w-4" />
      </Link>
    );
  }

  async function request() {
    setState('busy');
    try {
      const res = await fetch('/api/developer/upgrade-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      setState(res.ok && data.success ? 'done' : 'error');
    } catch {
      setState('error');
    }
  }

  if (state === 'done') {
    return (
      <span className={`${className} cursor-default opacity-90`}>
        <Check className="h-4 w-4" /> {t.requested.replace('{plan}', planName)}
      </span>
    );
  }

  return (
    <button type="button" onClick={request} disabled={state === 'busy'} className={className}>
      {state === 'error' ? t.err : t.request.replace('{plan}', planName)} <ArrowRight className="cta-arrow h-4 w-4" />
    </button>
  );
}
