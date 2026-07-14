import { LogoBadge, LogoMark } from "@/components/Logo";
import { LayoutDashboard, KeyRound, Users, Download, Plus, Search, TrendingUp, FileText, UsersRound } from "lucide-react";

/**
 * Hero product visual — an accurate preview of the Inlet dashboard.
 * Static/server-rendered; data is clearly illustrative (famous names as
 * placeholders), not a claim about real customers.
 */

const TREND = [30, 42, 38, 55, 48, 63, 58, 72, 66, 80, 74, 92];
const LEADS = [
  { name: "Ada Lovelace", email: "ada@example.com", form: "Portfolio", when: "2m ago" },
  { name: "Grace Hopper", email: "grace@example.com", form: "Contact", when: "14m ago" },
  { name: "Alan Turing", email: "alan@example.com", form: "Pricing", when: "1h ago" },
];

function Stat({ label, value, hint, tone }: { label: string; value: string; hint: string; tone: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5">
      <p className="text-[11px] font-medium text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
      <p className={`mt-1 text-[11px] font-medium ${tone}`}>{hint}</p>
    </div>
  );
}

export default function HeroPreview() {
  return (
    <div className="mx-auto mt-16 max-w-5xl px-4 fade-up" style={{ animationDelay: "220ms" }}>
      <div className="relative">
        <div aria-hidden className="pointer-events-none absolute -inset-x-16 -top-10 -z-10 h-48 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ring-1 ring-slate-900/5">
          {/* browser chrome */}
          <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-rose-400/70" />
            <span className="h-3 w-3 rounded-full bg-amber-400/70" />
            <span className="h-3 w-3 rounded-full bg-emerald-400/70" />
            <div className="mx-auto inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-400">
              <LogoMark className="h-3 w-3 text-slate-500" /> inlet — dashboard
            </div>
          </div>

          <div className="flex">
            {/* rail */}
            <div className="hidden w-16 shrink-0 flex-col items-center gap-3 border-r border-slate-100 bg-white py-4 sm:flex">
              <LogoBadge className="h-8 w-8 rounded-lg" />
              <div className="mt-2 flex flex-col items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><LayoutDashboard className="h-4.5 w-4.5" /></span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400"><KeyRound className="h-4.5 w-4.5" /></span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400"><Users className="h-4.5 w-4.5" /></span>
              </div>
            </div>

            {/* main */}
            <div className="min-w-0 flex-1 bg-slate-50/40 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Overview</h3>
                  <p className="text-[11px] text-slate-400">Every site&apos;s leads, in one place</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 sm:inline-flex"><Download className="h-3.5 w-3.5" /> Export</span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-2.5 py-1.5 text-[11px] font-semibold text-white"><Plus className="h-3.5 w-3.5" /> New form</span>
                </div>
              </div>

              {/* stat tiles */}
              <div className="mt-3 grid grid-cols-3 gap-3">
                <Stat label="Total leads" value="1,248" hint="↑ all-time" tone="text-blue-600" />
                <Stat label="Last 7 days" value="96" hint="↑ 18% vs prior" tone="text-emerald-600" />
                <Stat label="Active forms" value="7" hint="across 5 sites" tone="text-slate-400" />
              </div>

              {/* chart + top forms */}
              <div className="mt-3 grid gap-3 lg:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 lg:col-span-2">
                  <div className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500"><TrendingUp className="h-3.5 w-3.5 text-blue-500" /> Submission trend</div>
                  <div className="flex h-20 items-end gap-1.5">
                    {TREND.map((h, i) => (
                      <div key={i} className={`flex-1 rounded-sm ${i === TREND.length - 1 ? "bg-blue-500" : "bg-slate-200"}`} style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                  <div className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500"><FileText className="h-3.5 w-3.5 text-purple-500" /> Top forms</div>
                  <div className="space-y-2.5">
                    {[["Portfolio", 82], ["Contact", 64], ["Pricing", 41]].map(([n, w]) => (
                      <div key={n as string}>
                        <div className="mb-1 flex justify-between text-[10px] font-medium text-slate-500"><span>{n}</span><span className="text-slate-800">{w}</span></div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-500" style={{ width: `${w as number}%` }} /></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* leads table */}
              <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 px-3.5 py-2.5">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500"><UsersRound className="h-3.5 w-3.5" /> Lead database</span>
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2 py-1 text-[10px] text-slate-400"><Search className="h-3 w-3" /> Search</span>
                </div>
                <div className="divide-y divide-slate-50">
                  {LEADS.map((l) => (
                    <div key={l.email} className="flex items-center gap-3 px-3.5 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-slate-800">{l.name}</p>
                        <p className="truncate text-[11px] text-slate-400">{l.email}</p>
                      </div>
                      <span className="hidden rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 sm:inline">{l.form}</span>
                      <span className="w-14 text-right text-[10px] text-slate-400">{l.when}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
