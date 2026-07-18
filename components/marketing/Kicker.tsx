import type { ReactNode } from "react";

/**
 * Editorial monospace kicker — the eyebrow label used by the reference tier
 * (Raycast, basement.studio, Linear): Geist Mono, uppercase, wide tracking,
 * flanked by a thin rule. Deliberately replaces the gradient-border pill +
 * sparkle-icon eyebrow, which is the single clearest "AI-generated" tell.
 */
export function Kicker({
  children,
  center = false,
  tone = "dark",
  className = "",
}: {
  children: ReactNode;
  center?: boolean;
  tone?: "dark" | "light";
  className?: string;
}) {
  const ink = tone === "dark" ? "text-slate-400" : "text-slate-500";
  const rule = tone === "dark" ? "via-cyan-400/50" : "via-blue-500/40";
  return (
    <div
      className={`flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] ${ink} ${
        center ? "justify-center" : ""
      } ${className}`}
    >
      <span className={`h-px w-8 bg-gradient-to-r from-transparent ${rule}`} />
      <span>{children}</span>
      {center && <span className={`h-px w-8 bg-gradient-to-l from-transparent ${rule}`} />}
    </div>
  );
}
