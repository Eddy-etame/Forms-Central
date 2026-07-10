'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Scroll-reveal via IntersectionObserver + CSS transition — no animation
 * library. Content is visible (not hidden) until JS runs, so SEO and
 * no-JS users always see everything.
 */
export default function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return;
    }
    // Start hidden only once JS is live (no flash for no-JS/crawlers).
    el.classList.add('reveal-init');
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: '-60px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${className ?? ''} ${shown ? 'reveal-in' : ''}`.trim()}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
