'use client';

import { motion, useReducedMotion } from 'framer-motion';

/**
 * Route transition: every page enters with a soft rise + fade instead of a
 * hard cut. Template remounts per navigation, which is exactly what we want.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
