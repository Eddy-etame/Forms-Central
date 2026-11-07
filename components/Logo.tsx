import Link from 'next/link';

/**
 * Inlet mark — "Downlink": a signal descending into the inlet.
 * Primary strokes use currentColor; the dock bar uses the blue accent.
 */
export function LogoMark({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      <path d="M32 13 L32 34" stroke="currentColor" strokeWidth="6.5" strokeLinecap="round" />
      <path d="M21 25 L32 36 L43 25" stroke="currentColor" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="18" y="45" width="28" height="6.5" rx="3.25" fill="#2563EB" />
    </svg>
  );
}

/**
 * The mark inside a rounded navy tile with a subtle top-light gradient
 * (depth, not flatness). Pass sizing/rounding via className on the tile.
 */
export function LogoBadge({
  className = 'h-8 w-8 rounded-lg',
  markClassName = 'h-[62%] w-[62%]',
}: {
  className?: string;
  markClassName?: string;
}) {
  return (
    <span
      className={`relative inline-grid place-items-center text-white shadow-sm ${className}`}
      style={{ background: 'linear-gradient(150deg, #1E293B 0%, #0F172A 62%, #0B1220 100%)' }}
    >
      <LogoMark className={markClassName} />
    </span>
  );
}

/** Badge + wordmark, used in the marketing nav and footer. */
export function LogoLockup({
  badgeClassName = 'h-8 w-8 rounded-lg',
  textClassName = 'text-[15px]',
}: {
  badgeClassName?: string;
  textClassName?: string;
}) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <LogoBadge className={badgeClassName} />
      <span className={`font-semibold tracking-tight text-slate-900 ${textClassName}`}>Inlet</span>
    </Link>
  );
}

/**
 * EAM crest — the agency that builds and operates Inlet. The PNG is used as a
 * mask filled with currentColor, so the same asset reads on navy or paper.
 */
export function EamCrest({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 bg-current ${className}`}
      style={{
        WebkitMaskImage: 'url(/brand/eam-crest.png)',
        maskImage: 'url(/brand/eam-crest.png)',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
      }}
    />
  );
}

/** "by EAM" — the maker's line next to the Inlet wordmark. */
export function ByEam({ className = '', tone = 'light' }: { className?: string; tone?: 'light' | 'dark' }) {
  const ink = tone === 'dark' ? 'text-slate-400 hover:text-gold-bright' : 'text-slate-400 hover:text-gold-dim';
  return (
    <a
      href="https://eam-agency.vercel.app"
      target="_blank"
      rel="noopener"
      className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.22em] transition-colors ${ink} ${className}`}
    >
      <span>by</span>
      <EamCrest className="h-3.5 w-3.5" />
      <span className="font-serif normal-case text-[13px] tracking-normal">EAM</span>
    </a>
  );
}
