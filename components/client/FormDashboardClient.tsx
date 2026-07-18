'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, Download, Search, X, FileText, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface SingleFormStats {
  formName: string;
  allTime: number;
  past7Days: number;
  recentLeads: any[];
  dailyTrends: { date: string, count: number }[];
}

export default function FormDashboardClient({ stats }: { stats: SingleFormStats }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<any | null>(null);

  const exportToCSV = () => {
    if (!stats || stats.recentLeads.length === 0) return;
    
    // Extract all unique keys from payloads to form headers
    const allKeys = new Set<string>();
    stats.recentLeads.forEach(lead => {
      Object.keys(lead.payload).forEach(k => allKeys.add(k));
    });
    
    const headers = ['Date', ...Array.from(allKeys)];
    
    const csvRows = stats.recentLeads.map(lead => {
      const date = new Date(lead.created_at).toLocaleString('en-GB');
      
      const payloadData = Array.from(allKeys).map(key => {
        let val = lead.payload[key];
        if (typeof val === 'string') {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val || '';
      });
      
      return `"${date}",${payloadData.join(',')}`;
    });
    
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${stats.formName}_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = stats?.recentLeads.filter(lead => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return Object.values(lead.payload).some(val => 
      String(val).toLowerCase().includes(searchLower)
    );
  }) || [];

  const schemaKeys = stats?.recentLeads[0] 
    ? Object.keys(stats.recentLeads[0].payload).filter(k => k.toLowerCase() !== 'photos_count' && k.toLowerCase() !== 'ip_address')
    : [];

  const tableColumns = schemaKeys.slice(0, 5);

  const isFileUrl = (val: any) => typeof val === 'string' && val.startsWith('http') && val.includes('supabase.co/storage');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 w-fit mb-2 border border-blue-100">
            <FileText className="h-3 w-3" />
            Form view
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{stats?.formName}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Data and files submitted through this form.
          </p>
        </div>
        <button 
          onClick={exportToCSV}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV ({stats?.allTime})
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-sm"
        >
          <div className="absolute -right-4 -top-4 rounded-full bg-blue-50 p-8">
            <BarChart3 className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-sm font-medium text-slate-500">Total submissions</p>
          <h3 className="mt-2 text-4xl font-bold text-slate-900 dark:text-white">{stats?.allTime || 0}</h3>
          <div className="mt-4 flex items-center text-sm text-blue-600 font-medium">
            <TrendingUp className="mr-1 h-4 w-4" /> For this form
          </div>
        </motion.div>

        {stats && stats.allTime >= 10 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-sm"
          >
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-sm">Trend (last 30 days)</h3>
            <div className="h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.dailyTrends || []}>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} hide />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 shadow-sm flex items-center justify-center flex-col text-center"
          >
            <TrendingUp className="h-6 w-6 text-blue-400 mb-2" />
            <p className="text-sm font-semibold text-slate-900 dark:text-white">More data needed</p>
            <p className="text-xs text-slate-500">The chart unlocks at 10 submissions.</p>
          </motion.div>
        )}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col"
      >
        <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-slate-900 dark:text-white">Structured data</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search these results…" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="bg-white border-b border-slate-100 dark:border-slate-800 text-xs font-semibold uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4">Date</th>
                {tableColumns.map(col => (
                  <th key={col} className="px-6 py-4">{col.replace(/_/g, ' ')}</th>
                ))}
                {schemaKeys.length > 5 && (
                  <th className="px-6 py-4 text-slate-300">… ({schemaKeys.length - 5} more)</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={tableColumns.length + 2} className="px-6 py-12 text-center text-slate-500">
                    No data found.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const date = new Date(lead.created_at).toLocaleDateString('en-GB', {
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                  });
                  
                  return (
                    <tr 
                      key={lead.id} 
                      onClick={() => setSelectedLead(lead)}
                      className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                    >
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-900">
                        {date}
                      </td>
                      
                      {tableColumns.map(col => {
                        const val = lead.payload[col];
                        const isFile = isFileUrl(val);
                        
                        return (
                          <td key={col} className="px-6 py-4">
                            {isFile ? (
                              <a 
                                href={`/api/download?url=${encodeURIComponent(String(val))}`}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-200 transition-colors"
                              >
                                <Paperclip className="h-3 w-3" /> File
                              </a>
                            ) : (
                              <div className="max-w-[200px] truncate" title={String(val || '')}>
                                {String(val || '-')}
                              </div>
                            )}
                          </td>
                        )
                      })}
                      
                      {schemaKeys.length > 5 && (
                        <td className="px-6 py-4 text-xs text-blue-600 font-medium">
                          View details &rarr;
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLead(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-6 py-4 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">Full submission</h3>
                  <p className="text-xs text-slate-500">
                    Submitted {new Date(selectedLead.created_at).toLocaleString('en-GB')}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedLead(null)}
                  className="rounded-full p-2 hover:bg-slate-200 transition-colors"
                >
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(selectedLead.payload).map(([key, value]) => {
                    const isFile = isFileUrl(value);
                    const isLongText = typeof value === 'string' && value.length > 100;
                    
                    return (
                      <div 
                        key={key} 
                        className={`rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm p-5 ${isLongText ? 'md:col-span-2' : ''}`}
                      >
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-50 pb-2">
                          {key.replace(/_/g, ' ')}
                        </p>
                        
                        {isFile ? (
                          <div className="flex flex-col gap-4">
                            {String(value).match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                              <div className="relative h-40 w-full overflow-hidden rounded-lg bg-slate-50 dark:bg-slate-950/60 flex items-center justify-center border border-slate-100 dark:border-slate-800">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={String(value)} alt={key} className="max-h-full max-w-full object-contain" />
                              </div>
                            ) : (
                              <div className="h-16 w-full rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                                <Paperclip className="h-6 w-6 text-blue-400 mr-2" />
                                <span className="text-sm font-medium text-blue-700">Attached document</span>
                              </div>
                            )}
                            <a 
                              href={`/api/download?url=${encodeURIComponent(String(value))}`}
                              download
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors w-full"
                            >
                              <Download className="h-4 w-4" />
                              Download file
                            </a>
                          </div>
                        ) : (
                          <div className="prose prose-sm prose-slate max-w-none text-slate-700 dark:text-slate-300">
                            {String(value).split('\n').map((line, i) => (
                              <p key={i} className="my-1">{line}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-950/60 flex justify-end shrink-0">
                <button 
                  onClick={() => setSelectedLead(null)}
                  className="rounded-lg bg-white border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
