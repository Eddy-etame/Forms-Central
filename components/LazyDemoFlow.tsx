'use client';

import { useEffect, useRef, useState, lazy, Suspense } from 'react';

const DemoFlow = lazy(() => import('./DemoFlow'));

/**
 * Defers the animated demo (and its framer-motion dependency) until the
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
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Watch a lead arrive</h2>
          <p className="mt-4 text-lg text-slate-600">
            A real submission passes the gates and lands in your inbox — a bot doesn&apos;t.
          </p>
        </div>
        <div className="h-[300px] md:h-[240px]" />
      </div>
    </section>
  );

  return (
    <div ref={ref}>
      {near ? <Suspense fallback={placeholder}>{<DemoFlow />}</Suspense> : placeholder}
    </div>
  );
}
