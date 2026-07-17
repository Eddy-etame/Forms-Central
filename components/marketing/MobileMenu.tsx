'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight } from 'lucide-react';

const LINKS = [
  { href: '/#features', label: 'Features' },
  { href: '/#how', label: 'How it works' },
  { href: '/docs', label: 'Docs' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/#faq', label: 'FAQ' },
];

/**
 * Mobile navigation for the marketing pages. Below md the nav links used to
 * simply disappear — most first visits are mobile, so this was a broken
 * funnel, not a styling gap.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);

  // Lock scroll while open; close on Escape.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50"
      >
        {open ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
      </button>

      {open && (
        <div className="fixed inset-x-0 top-16 bottom-0 z-50 overflow-y-auto border-t border-slate-100 bg-white/95 backdrop-blur-xl">
          <nav className="flex flex-col gap-1 px-6 py-6">
            {LINKS.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="fade-up rounded-xl px-4 py-3.5 text-lg font-semibold text-slate-800 transition-colors hover:bg-slate-50"
                style={{ animationDelay: `${i * 45}ms` }}
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-6">
              <Link
                href="/client/signup"
                onClick={() => setOpen(false)}
                className="btn-shine inline-flex h-12 items-center justify-center gap-2 rounded-full bg-slate-900 text-base font-semibold text-white"
              >
                Get started free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/client/login"
                onClick={() => setOpen(false)}
                className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 text-base font-medium text-slate-800"
              >
                Sign in
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
