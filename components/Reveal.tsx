'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Scroll-reveal via IntersectionObserver + CSS transition — no animation
 * library. Content is fully visible until JS runs (the hiding rules are gated
 * on `html.reveal-ready`, set pre-paint by an inline script in the root
 * layout), so SEO and no-JS users always see everything.
 *
 * Both `reveal-init` and `reveal-in` stay in the React-controlled className so
 * the `.reveal-init.reveal-in` transition actually runs — the element glides
 * in rather than popping.
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
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      // Fire a little before the element is fully in view for a natural feel.
      { rootMargin: '0px 0px -12% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const cls = [className, 'reveal-init', shown ? 'reveal-in' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={ref}
      className={cls}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
