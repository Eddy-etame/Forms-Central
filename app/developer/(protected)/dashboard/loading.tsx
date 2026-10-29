import { BarChart3, TrendingUp, Users, FileText, CalendarDays, Download, Search } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-48 bg-slate-200 rounded-md"></div>
          <div className="h-4 w-64 bg-slate-100 rounded-md"></div>
        </div>
        <div className="h-10 w-32 bg-slate-200 rounded-lg"></div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="absolute -right-4 -top-4 rounded-full bg-slate-50 p-8">
              <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
            </div>
            <div className="h-4 w-24 bg-slate-200 rounded-md"></div>
            <div className="mt-2 h-10 w-16 bg-slate-200 rounded-md"></div>
            <div className="mt-4 h-4 w-32 bg-slate-100 rounded-md"></div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="h-5 w-48 bg-slate-200 rounded-md mb-6"></div>
          <div className="h-[250px] w-full bg-slate-50 rounded-lg"></div>
        </div>

        <div className="lg:col-span-1 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col">
          <div className="h-5 w-32 bg-slate-200 rounded-md mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-slate-200 rounded-md"></div>
                  <div className="h-4 w-8 bg-slate-200 rounded-md"></div>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="border-b border-slate-50 bg-slate-50/50 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="h-5 w-48 bg-slate-200 rounded-md"></div>
          <div className="h-9 w-full sm:w-64 bg-slate-200 rounded-lg"></div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 w-full bg-slate-50 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
