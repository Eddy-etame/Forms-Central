'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, Users, FileText, CalendarDays, Download, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  allTime: number;
  past7Days: number;
  formsCount: number;
  recentLeads: any[];
  dailyTrends: { date: string, count: number }[];
  formPerformance: { name: string, count: number }[];
}

export default function GlobalDashboardClient({ stats }: { stats: DashboardStats }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<any | null>(null);

  const exportToCSV = () => {
    if (!stats || stats.recentLeads.length === 0) return;
    
    // Extract all unique keys from payloads to form headers
    const allKeys = new Set<string>();
    stats.recentLeads.forEach(lead => {
      Object.keys(lead.payload).forEach(k => allKeys.add(k));
    });
    
    const headers = ['Date', 'Formulaire', ...Array.from(allKeys)];
    
    const csvRows = stats.recentLeads.map(lead => {
      const date = new Date(lead.created_at).toLocaleString('fr-FR');
      const formName = lead.forms?.name || 'Inconnu';
      
      const payloadData = Array.from(allKeys).map(key => {
        let val = lead.payload[key];
        if (typeof val === 'string') {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val || '';
      });
      
      return `"${date}","${formName}",${payloadData.join(',')}`;
    });
    
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = stats?.recentLeads.filter(lead => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    if (lead.forms?.name?.toLowerCase().includes(searchLower)) return true;
    return Object.values(lead.payload).some(val => 
      String(val).toLowerCase().includes(searchLower)
    );
  }) || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Vue d'ensemble</h1>
          <p className="text-sm text-slate-500">
            Gérez vos formulaires et consultez vos derniers leads.
          </p>
        </div>
        <button 
          onClick={exportToCSV}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800 transition-colors"
        >
          <Download className="h-4 w-4" />
          Exporter CSV
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="absolute -right-4 -top-4 rounded-full bg-blue-50 p-8">
            <Users className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-sm font-medium text-slate-500">Total des Leads</p>
          <h3 className="mt-2 text-4xl font-bold text-slate-900">{stats?.allTime || 0}</h3>
          <div className="mt-4 flex items-center text-sm text-blue-600 font-medium">
            <TrendingUp className="mr-1 h-4 w-4" /> Volume global
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="absolute -right-4 -top-4 rounded-full bg-emerald-50 p-8">
            <BarChart3 className="h-8 w-8 text-emerald-500" />
          </div>
          <p className="text-sm font-medium text-slate-500">Les 7 derniers jours</p>
          <h3 className="mt-2 text-4xl font-bold text-slate-900">{stats?.past7Days || 0}</h3>
          <div className="mt-4 flex items-center text-sm text-emerald-600 font-medium">
            <CalendarDays className="mr-1 h-4 w-4" /> Dynamique récente
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="absolute -right-4 -top-4 rounded-full bg-purple-50 p-8">
            <FileText className="h-8 w-8 text-purple-500" />
          </div>
          <p className="text-sm font-medium text-slate-500">Formulaires Actifs</p>
          <h3 className="mt-2 text-4xl font-bold text-slate-900">{stats?.formsCount || 0}</h3>
          <div className="mt-4 flex items-center text-sm text-purple-600 font-medium">
            <FileText className="mr-1 h-4 w-4" /> Sources de conversion
          </div>
        </motion.div>
      </div>

      {stats && stats.allTime >= 15 ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 className="font-bold text-slate-900 mb-6">Tendance des Soumissions (30 jours)</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.dailyTrends || []}>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col"
          >
            <h3 className="font-bold text-slate-900 mb-6">Top Formulaires</h3>
            <div className="flex-1 space-y-4 overflow-y-auto">
              {stats?.formPerformance.length === 0 ? (
                <p className="text-sm text-slate-500 text-center mt-10">Aucune donnée.</p>
              ) : (
                stats?.formPerformance.map((form, idx) => {
                  const total = stats.allTime || 1;
                  const percentage = Math.round((form.count / total) * 100);
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-slate-700 truncate pr-4">{form.name}</span>
                        <span className="font-bold text-slate-900">{form.count}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 shadow-sm text-center"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Analytique avancée bientôt disponible</h3>
          <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
            Les graphiques et statistiques de performance se débloqueront automatiquement une fois que vous aurez atteint <strong>15 leads</strong>. Collectez encore {15 - (stats?.allTime || 0)} leads pour y accéder !
          </p>
        </motion.div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col"
      >
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-slate-900">Base de Données Leads</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Chercher un nom, email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-white border-b border-slate-100 text-xs font-semibold uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Formulaire</th>
                <th className="px-6 py-4">Identité Principale</th>
                <th className="px-6 py-4">Aperçu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    Aucun lead ne correspond à votre recherche.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const date = new Date(lead.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                  });
                  const nameKey = Object.keys(lead.payload).find(k => k.toLowerCase() === 'nom' || k.toLowerCase() === 'name');
                  const emailKey = Object.keys(lead.payload).find(k => k.toLowerCase() === 'email');
                  const name = nameKey ? lead.payload[nameKey] : 'Inconnu';
                  const email = emailKey ? lead.payload[emailKey] : 'Inconnu';
                  
                  const otherData = Object.entries(lead.payload).filter(([k]) => k !== nameKey && k !== emailKey);
                  
                  return (
                    <tr 
                      key={lead.id} 
                      onClick={() => setSelectedLead(lead)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-900">
                        {date}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                          {lead.forms?.name || 'Inconnu'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{name}</div>
                        <div className="text-xs text-slate-500">{email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-md truncate text-xs text-slate-500">
                          {otherData.map(([k, v]) => (
                            <span key={k} className="mr-3">
                              <span className="font-semibold text-slate-700 capitalize">{k.replace(/_/g, ' ')}:</span> {String(v)}
                            </span>
                          ))}
                        </div>
                      </td>
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
              <div className="border-b border-slate-100 bg-slate-50 px-6 py-4 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Détails de la soumission</h3>
                  <p className="text-xs text-slate-500">
                    Reçu le {new Date(selectedLead.created_at).toLocaleString('fr-FR')} via <strong>{selectedLead.forms?.name}</strong>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(selectedLead.payload).map(([key, value]) => {
                    const isSupabaseUrl = typeof value === 'string' && value.startsWith('http') && value.includes('supabase.co/storage');
                    
                    return (
                      <div key={key} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                          {key.replace(/_/g, ' ')}
                        </p>
                        
                        {isSupabaseUrl ? (
                          <div className="flex flex-col gap-3">
                            <div className="relative h-32 w-full overflow-hidden rounded-md border border-slate-200 bg-white flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={String(value)} alt={key} className="max-h-full max-w-full object-contain" />
                            </div>
                            <a 
                              href={`/api/download?url=${encodeURIComponent(String(value))}`}
                              download
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center justify-center gap-2 rounded bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors self-start"
                            >
                              <Download className="h-3 w-3" />
                              Télécharger l'image
                            </a>
                          </div>
                        ) : (
                          <p className="text-sm font-medium text-slate-900 break-words whitespace-pre-wrap">
                            {String(value)}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="border-t border-slate-100 px-6 py-4 bg-slate-50 flex justify-end shrink-0">
                <button 
                  onClick={() => setSelectedLead(null)}
                  className="rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
