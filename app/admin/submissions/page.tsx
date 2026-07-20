'use client';

import { useState, useEffect } from 'react';
import { Eye, FileText, Download } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { getSubmissions } from '@/lib/actions';
import { useLocale } from '@/lib/useLocale';
import { getAppDict } from '@/lib/appDict';
import type { AppDict } from '@/lib/appDict';

interface Submission {
  id: string;
  form_id: string;
  payload: Record<string, string>;
  ip_address: string;
  fingerprint: string;
  created_at: string;
  forms: {
    name: string;
  } | null;
}

function formatPayloadPreview(payload: Record<string, string>, t: AppDict['admin']['submissions']): string {
  if (!payload || Object.keys(payload).length === 0) return t.noData;
  
  const entries = Object.entries(payload)
    .filter(([k]) => k !== '_gotcha')
    .slice(0, 3)
    .map(([k, v]) => {
      const valStr = String(v);
      const truncatedVal = valStr.length > 25 ? valStr.substring(0, 25) + '...' : valStr;
      return `${k}: ${truncatedVal}`;
    });
    
  let preview = entries.join(', ');
  if (Object.keys(payload).length > 3) {
    preview += ' ...';
  }
  return preview;
}

export default function SubmissionsPage() {
  const t = getAppDict(useLocale()).admin.submissions;
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);

  useEffect(() => {
    loadSubmissions();
  }, []);

  async function loadSubmissions() {
    try {
      const data = await getSubmissions();
      setSubmissions((data as unknown as Submission[]) || []);
    } catch (err) {
      console.error('Failed to load submissions:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleExportCSV = () => {
    if (submissions.length === 0) return;
    
    const allKeys = new Set<string>();
    submissions.forEach(sub => Object.keys(sub.payload).forEach(k => allKeys.add(k)));
    const keysArray = Array.from(allKeys).filter(k => k !== '_gotcha');
    
    const headers = [t.colDate, t.colForm, 'IP', ...keysArray];

    const rows = submissions.map(sub => {
      const date = new Date(sub.created_at).toLocaleString('en-GB');
      const formName = sub.forms ? sub.forms.name : t.unknownForm;
      const ip = sub.ip_address || '';
      
      const payloadCols = keysArray.map(key => {
        let val = sub.payload[key] || '';
        val = String(val).replace(/"/g, '""');
        // Remove newlines to keep CSV structure clean
        val = val.replace(/\n/g, ' '); 
        return `"${val}"`;
      });
      
      return `"${date}","${formName}","${ip}",${payloadCols.join(',')}`;
    });
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leads_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t.title}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t.subtitle}</p>
        </div>
        <Button
          onClick={handleExportCSV}
          disabled={submissions.length === 0}
          className="flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800"
        >
          <Download className="w-4 h-4" />
          {t.exportCsv}
        </Button>
      </div>

      {/* Leads Table */}
      <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-xs">
        {submissions.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center justify-center">
            <FileText className="h-10 w-10 text-slate-300" />
            <span className="text-sm font-medium text-slate-400 mt-2">{t.noLeads}</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-500 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">{t.colDate}</th>
                  <th className="px-4 py-3">{t.colForm}</th>
                  <th className="px-4 py-3">{t.colIp}</th>
                  <th className="px-4 py-3">{t.colDataPreview}</th>
                  <th className="px-4 py-3 text-right">{t.colAction}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/50 dark:bg-slate-900/60 transition-colors">
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                      {new Date(sub.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {sub.forms ? sub.forms.name : t.unknownForm}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs">{sub.ip_address}</td>
                    <td className="px-4 py-3.5 max-w-[300px] truncate text-xs text-slate-700 font-medium">
                      {formatPayloadPreview(sub.payload, t)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedSub(sub)}
                        className="inline-flex items-center gap-1 text-xs text-slate-900 dark:text-white font-semibold hover:opacity-85"
                      >
                        <Eye className="h-3.5 w-3.5" /> {t.details}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selected lead details modal */}
      {selectedSub && (
        <Modal
          isOpen={!!selectedSub}
          onClose={() => setSelectedSub(null)}
          title={t.leadDetailsTitle}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-xs border-b border-slate-100 dark:border-slate-800 pb-3 text-slate-400 font-medium">
              <div>
                {t.dateLabel} <span className="text-slate-800 font-semibold">{new Date(selectedSub.created_at).toLocaleString()}</span>
              </div>
              <div className="text-right">
                {t.ipLabel} <span className="text-slate-800 font-mono font-semibold">{selectedSub.ip_address}</span>
              </div>
            </div>

            {selectedSub.fingerprint && (
              <div className="text-[10px] text-slate-400 font-mono">
                {t.fingerprintLabel} <span className="bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 px-1 py-0.5 rounded-sm">{selectedSub.fingerprint}</span>
              </div>
            )}

            <div className="space-y-3 mt-4 max-h-96 overflow-y-auto pr-2">
              {Object.entries(selectedSub.payload).map(([key, val]) => (
                <div key={key} className="space-y-1 bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 p-2.5 rounded-lg">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">{key}</span>
                  <p className="text-xs text-slate-800 font-medium whitespace-pre-wrap">{val}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
              <Button onClick={() => setSelectedSub(null)}>{t.close}</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
