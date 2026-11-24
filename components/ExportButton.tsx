'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { useLocale } from '@/lib/useLocale';
import { downloadFile } from '@/lib/downloadFile';

const COPY = {
  en: { busy: 'Preparing the file…', failed: 'The export did not come through. Reload the page and try again.', tooLarge: 'Too many leads for one file: export one form at a time.' },
  fr: { busy: 'Préparation du fichier…', failed: 'L’export n’a pas abouti. Rechargez la page et réessayez.', tooLarge: 'Trop de leads pour un seul fichier : exportez un formulaire à la fois.' },
} as const;

/**
 * Downloads a complete CSV export from the server (every lead, not only the
 * rows on screen). Says when it is working and when it failed.
 */
export default function ExportButton({ href, label, className }: { href: string; label: string; className: string }) {
  const c = COPY[useLocale()];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const r = await downloadFile(href, 'leads.csv');
      if (!r.ok) setError(r.status === 413 ? c.tooLarge : c.failed);
    } catch {
      setError(c.failed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-stretch gap-1">
      <button type="button" onClick={run} disabled={busy} aria-busy={busy} className={`${className} disabled:cursor-wait disabled:opacity-70`}>
        <Download className="h-4 w-4" aria-hidden="true" />
        {busy ? c.busy : label}
      </button>
      {error && <span role="alert" className="max-w-xs text-xs font-medium text-red-600 dark:text-red-400">{error}</span>}
    </span>
  );
}
