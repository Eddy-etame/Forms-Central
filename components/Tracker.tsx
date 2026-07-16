'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const IGNORED = ['/admin', '/client', '/portal', '/login'];

/** First-party pageview beacon — public marketing pages only. */
export default function Tracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    if (IGNORED.some((p) => pathname === p || pathname.startsWith(p + '/'))) return;
    try {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: pathname, referrer: document.referrer || '' }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* never let analytics break a page */
    }
  }, [pathname]);

  return null;
}
