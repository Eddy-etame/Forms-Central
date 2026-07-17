'use client';

import { useEffect, useRef, useState, lazy, Suspense } from 'react';

const DemoFlow = lazy(() => import('./marketing/LiveDemo'));

/**
 * Defers the PLAYABLE demo (and its framer-motion dependency) until the
 * visitor scrolls near it — the landing's initial JS stays lean.
 * The placeholder reserves height so nothing shifts.
 */
export default function LazyDemoFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: '600px' } // start loading well before it's visible
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const placeholder = (
    <section className="border-y border-slate-100 bg-slate-50/60 py-20" aria-busy="true">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Don&apos;t read about it. Use it.</h2>
          <p className="mt-4 text-lg text-slate-600">
            The real pipeline — proof-of-work, spam scan, delivery, auto-reply — running in your browser.
          </p>
        </div>
        <div className="h-[560px] md:h-[420px]" />
      </div>
    </section>
  );

  return (
    <div ref={ref}>
      {near ? <Suspense fallback={placeholder}>{<DemoFlow />}</Suspense> : placeholder}
    </div>
  );
}
