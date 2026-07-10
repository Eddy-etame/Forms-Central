/**
 * Route transition — pure CSS (see .page-enter in globals.css).
 * Zero JS shipped: framer-motion must not ride along on every route.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
