'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import ClientSidebar from '@/components/client/ClientSidebar';

type SidebarDict = { general: string; overview: string; developer: string; endClients: string; yourForms: string; noForms: string; signOut: string; lightMode: string; darkMode: string };

/** Hamburger + slide-in drawer — the only way to reach Developer/End-clients/
 *  other forms below the `lg` breakpoint, where the desktop ClientSidebar and
 *  the ⌘K palette trigger are both hidden. */
export default function MobileSidebar({ forms, t }: { forms: { id: string; name: string }[]; t: SidebarDict }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg p-2 -ml-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[80] lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="absolute inset-y-0 left-0 h-full w-72 max-w-[85vw] shadow-2xl"
            >
              <div className="relative h-full">
                <button
                  onClick={() => setOpen(false)}
                  className="absolute right-3 top-3 z-10 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
                <ClientSidebar forms={forms} t={t} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
