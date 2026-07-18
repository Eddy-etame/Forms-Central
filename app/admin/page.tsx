'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Users, ShieldAlert, ArrowRight, Activity } from 'lucide-react';
import { StatsCard } from '@/components/admin/StatsCard';
import { getDashboardStats } from '@/lib/actions';
import BlurFade from '@/components/magicui/blur-fade';

interface Submission {
  id: string;
  form_id: string;
  ip_address: string;
  created_at: string;
  forms: {
    name: string;
  } | null;
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    formsCount: 0,
    clientsCount: 0,
    submissionsCount: 0,
    blacklistCount: 0,
  });
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const data = await getDashboardStats();

        setStats({
          formsCount: data.formsCount,
          clientsCount: data.clientsCount,
          submissionsCount: data.submissionsCount,
          blacklistCount: data.blacklistCount,
        });

        // Cast nested relation
        setRecentSubmissions((data.recentSubmissions as unknown as Submission[]) || []);
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
          <span className="text-sm font-medium text-slate-500">Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Overview of your form service activity.</p>
      </div>

      {/* Stats Cards grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <BlurFade delay={0.1}>
          <StatsCard title="Forms" value={stats.formsCount} icon={FileText} />
        </BlurFade>
        <BlurFade delay={0.15}>
          <StatsCard title="Clients" value={stats.clientsCount} icon={Users} />
        </BlurFade>
        <BlurFade delay={0.2}>
          <StatsCard title="Leads received" value={stats.submissionsCount} icon={Activity} />
        </BlurFade>
        <BlurFade delay={0.25}>
          <StatsCard title="Blacklist" value={stats.blacklistCount} icon={ShieldAlert} />
        </BlurFade>
      </div>

      {/* Submissions Section */}
      <BlurFade delay={0.3}>
      <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent submissions</h3>
            <p className="text-xs text-slate-400 font-medium">The 5 most recent leads across your forms.</p>
          </div>
          <Link
            href="/admin/submissions"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white hover:opacity-80 transition-opacity"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="mt-6 overflow-hidden">
          {recentSubmissions.length === 0 ? (
            <BlurFade delay={0.3}>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="text-sm font-medium text-slate-400">No leads yet.</span>
              </div>
            </BlurFade>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentSubmissions.map((sub, idx) => (
                <BlurFade key={sub.id} delay={0.3 + idx * 0.05}>
                  <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-slate-400">
                        {sub.forms ? sub.forms.name : 'Unknown form'}
                      </span>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Submission ID: <span className="font-mono text-xs font-medium bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 px-1 py-0.5 rounded-sm">{sub.id.substring(0, 8)}...</span>
                      </h4>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="text-xs font-medium text-slate-500 block">IP: {sub.ip_address}</span>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        {new Date(sub.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </BlurFade>
              ))}
            </div>
          )}
        </div>
      </div>
    </BlurFade>
    </div>
  );
}
