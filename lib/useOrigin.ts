'use client';

import { useSyncExternalStore } from 'react';

// The browser origin, safe to render on the first paint. The server (and the
// hydration pass) use the configured site URL; the real `window.location.origin`
// takes over right after, without a hydration mismatch — which is what a bare
// `typeof window !== 'undefined' ? window.location.origin : ''` in render caused
// (React #418 on the clients page).
const SERVER_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/+$/, '');
const subscribe = () => () => {};
const getClientSnapshot = () => window.location.origin;
const getServerSnapshot = () => SERVER_ORIGIN;

export function useOrigin(): string {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
