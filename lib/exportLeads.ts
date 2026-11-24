import { supabase } from './supabase';
import { toCsv } from './csv';
import { attachmentPath } from './storage';
import { downloadHref } from './attachments';
import { SITE_URL } from './seo';

/**
 * The complete export of a set of forms' leads, as one CSV file.
 *
 * "Complete" is the point: the browser-side export it replaces wrote only the
 * rows the page had loaded (1000 for a developer, 500 for a client) under a
 * button that showed the all-time count. Retention notices tell people to
 * export before a deletion — the export has to hold everything.
 */

const PAGE = 1000;
/** Above this a single file stops being a file people can open; the caller says so instead of truncating. */
export const EXPORT_MAX_ROWS = 50_000;

const LABELS = {
  en: { date: 'Date (UTC)', form: 'Form', client: 'Client', status: 'Status', todo: 'To handle', done: 'Handled', handledOn: 'Handled on (UTC)', flag: 'Flagged' },
  fr: { date: 'Date (UTC)', form: 'Formulaire', client: 'Client', status: 'Statut', todo: 'À traiter', done: 'Traitée', handledOn: 'Traitée le (UTC)', flag: 'Signalé' },
} as const;

const stamp = (iso: string | null | undefined) => (iso ? new Date(iso).toISOString().replace('T', ' ').slice(0, 16) : '');

export interface ExportForm {
  id: string;
  name: string;
  clientName?: string | null;
}

export type ExportResult = { ok: true; csv: string; rows: number } | { ok: false; reason: 'too_many' | 'database' };

export async function exportLeadsCsv(o: {
  forms: ExportForm[];
  lang: 'fr' | 'en';
  /** developers see which client each lead belongs to; a client's own export does not need the column */
  withClient: boolean;
}): Promise<ExportResult> {
  const L = LABELS[o.lang];
  const byId = new Map(o.forms.map((f) => [f.id, f]));
  const formIds = [...byId.keys()];

  type Row = { id: string; form_id: string; payload: Record<string, unknown> | null; created_at: string; handled_at?: string | null; spam_status?: string | null; spam_reason?: string | null };
  const leads: Row[] = [];
  if (formIds.length > 0) {
    for (let from = 0; ; from += PAGE) {
      if (from >= EXPORT_MAX_ROWS) return { ok: false, reason: 'too_many' };
      const { data, error } = await supabase
        .from('submissions')
        .select('id, form_id, payload, created_at, handled_at, spam_status, spam_reason')
        .in('form_id', formIds)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .range(from, from + PAGE - 1);
      if (error) {
        console.error('[EXPORT]', error.message);
        return { ok: false, reason: 'database' };
      }
      leads.push(...((data ?? []) as Row[]));
      if (!data || data.length < PAGE) break;
    }
  }

  // Field columns: every key any lead carries, in the order first met (newest lead first).
  const keys: string[] = [];
  const seen = new Set<string>();
  for (const l of leads) {
    for (const k of Object.keys(l.payload ?? {})) {
      if (!seen.has(k)) { seen.add(k); keys.push(k); }
    }
  }
  const anyFlag = leads.some((l) => l.spam_status === 'suspect');

  const headers = [L.date, L.form, ...(o.withClient ? [L.client] : []), L.status, L.handledOn, ...(anyFlag ? [L.flag] : []), ...keys];
  const rows = leads.map((l) => {
    const form = byId.get(l.form_id);
    const fields = keys.map((k) => {
      const v = (l.payload ?? {})[k];
      // An attachment is exported as the link that checks the session before serving the file.
      return attachmentPath(v) ? `${SITE_URL}${downloadHref(l.id, k)}` : v;
    });
    return [
      stamp(l.created_at),
      form?.name ?? '',
      ...(o.withClient ? [form?.clientName ?? ''] : []),
      l.handled_at ? L.done : L.todo,
      stamp(l.handled_at),
      ...(anyFlag ? [l.spam_status === 'suspect' ? l.spam_reason || L.flag : ''] : []),
      ...fields,
    ];
  });

  return { ok: true, csv: toCsv(headers, rows), rows: rows.length };
}

/** A file name that says what and when, and is safe in a Content-Disposition header. */
export function exportFileName(label: string | null): string {
  const slug = (label ?? '')
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase().slice(0, 40);
  return `leads${slug ? `-${slug}` : ''}-${new Date().toISOString().slice(0, 10)}.csv`;
}

export function csvResponse(csv: string, fileName: string, rows: number): Response {
  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'no-store',
      'X-Inlet-Rows': String(rows),
    },
  });
}
