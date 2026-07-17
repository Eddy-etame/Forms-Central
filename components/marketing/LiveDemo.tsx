'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Send, Bot, ShieldCheck, Inbox, Mail, Cpu, CheckCircle2, Sparkles,
} from 'lucide-react';

/**
 * The playable demo — the visitor drives the actual pipeline instead of
 * watching a loop. Type, hit send, watch the lead cross the stream into the
 * inbox and the auto-reply fire. Or press "Try as a spam bot" and get caught
 * by the shield. Fully client-side simulation of the real submit flow.
 */

type Stage = 'idle' | 'pow' | 'scan' | 'travel' | 'done';

interface DemoLead {
  id: number;
  name: string;
  email: string;
  message: string;
}

const SEED: DemoLead[] = [
  { id: 1, name: 'Amara Diallo', email: 'amara@studio.co', message: 'Loved the quote — when can we start?' },
];

export default function LiveDemo() {
  const reduce = useReducedMotion();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [stage, setStage] = useState<Stage>('idle');
  const [leads, setLeads] = useState<DemoLead[]>(SEED);
  const [blocked, setBlocked] = useState(0);
  const [replies, setReplies] = useState(0);
  const [autoReplyTo, setAutoReplyTo] = useState<string | null>(null);
  const [botCaught, setBotCaught] = useState(false);
  const idRef = useRef(2);

  const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, reduce ? 60 : ms));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stage !== 'idle') return;

    setAutoReplyTo(null);
    setStage('pow');
    await wait(800);
    setStage('scan');
    await wait(600);
    setStage('travel');
    await wait(650);

    const lead: DemoLead = {
      id: idRef.current++,
      name: name.trim() || 'You',
      email: email.trim() || 'you@example.com',
      message: message.trim() || 'Hello from the live demo — this just worked.',
    };
    setLeads((l) => [lead, ...l].slice(0, 3));
    setAutoReplyTo(lead.email);
    setReplies((r) => r + 1);
    setStage('done');
    await wait(1800);
    setStage('idle');
  };

  const submitAsBot = async () => {
    if (stage !== 'idle' || botCaught) return;
    setBotCaught(true);
    setBlocked((b) => b + 1);
    setTimeout(() => setBotCaught(false), 2400);
  };

  const busy = stage !== 'idle';

  const statusLine =
    stage === 'pow' ? { icon: Cpu, text: 'Solving proof-of-work…', cls: 'text-blue-600' } :
    stage === 'scan' ? { icon: ShieldCheck, text: 'Scanning for spam…', cls: 'text-emerald-600' } :
    stage === 'travel' ? { icon: Send, text: 'Delivering…', cls: 'text-cyan-600' } :
    stage === 'done' ? { icon: CheckCircle2, text: 'Delivered — check the inbox →', cls: 'text-emerald-600' } :
    null;

  return (
    <section id="demo" className="border-y border-slate-100 bg-slate-50/60 py-20" aria-label="Playable demo of the submission pipeline">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mb-12 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-cyan-600">
            <Sparkles className="h-4 w-4" /> Playable demo
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Don&apos;t read about it. <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Use it.</span>
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            This is the real pipeline — proof-of-work, spam scan, delivery, auto-reply — running in your browser. Type something and hit send. Then try to spam it.
          </p>
        </div>

        <div className="relative grid items-stretch gap-6 lg:grid-cols-[1fr_auto_1fr]">
          {/* ---------------- The form (visitor side) ---------------- */}
          <div className={`relative rounded-3xl border bg-white p-6 shadow-sm transition-colors duration-300 ${botCaught ? 'border-rose-300' : 'border-slate-200'}`}>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Your website&apos;s form</p>
            <form onSubmit={submit} className="space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                disabled={busy}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                type="email"
                disabled={busy}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Say anything — it lands in the inbox on the right."
                rows={3}
                disabled={busy}
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
              />
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={busy}
                  className="btn-shine inline-flex h-10 items-center gap-2 rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition-all duration-300 hover:bg-slate-800 hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-70"
                >
                  <Send className="h-3.5 w-3.5" /> Send
                </button>
                <button
                  type="button"
                  onClick={submitAsBot}
                  disabled={busy || botCaught}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 px-5 text-sm font-medium text-slate-600 transition-all duration-300 hover:border-rose-300 hover:text-rose-600 disabled:opacity-60"
                >
                  <Bot className="h-4 w-4" /> Try as a spam bot
                </button>
              </div>
            </form>

            {/* pipeline status */}
            <div className="mt-4 flex h-5 items-center text-xs font-medium" aria-live="polite">
              {statusLine && (
                <span className={`inline-flex items-center gap-1.5 ${statusLine.cls}`}>
                  <statusLine.icon className={`h-3.5 w-3.5 ${stage === 'pow' ? 'animate-spin' : ''}`} />
                  {statusLine.text}
                </span>
              )}
              {!statusLine && !botCaught && <span className="text-slate-400">No SMTP. No backend. This form holds nothing.</span>}
              {botCaught && (
                <span className="inline-flex items-center gap-1.5 text-rose-600">
                  <ShieldCheck className="h-3.5 w-3.5" /> Honeypot tripped — bot blocked, silently. It thinks it succeeded.
                </span>
              )}
            </div>
          </div>

          {/* ---------------- The stream (the inlet) ---------------- */}
          <div className="relative hidden w-24 items-center justify-center lg:flex" aria-hidden>
            <svg viewBox="0 0 96 160" className="h-40 w-24 overflow-visible">
              <defs>
                <linearGradient id="streamGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <path d="M0 60 C 36 60, 60 80, 96 80" fill="none" stroke="url(#streamGrad)" strokeWidth="2" className="flow-dash" opacity="0.7" />
              <path d="M0 100 C 36 100, 60 84, 96 82" fill="none" stroke="url(#streamGrad)" strokeWidth="1.5" className="flow-dash" style={{ animationDelay: '-0.4s' }} opacity="0.4" />
              {/* the travelling lead */}
              <AnimatePresence>
                {stage === 'travel' && !reduce && (
                  <motion.circle
                    r="5"
                    fill="#06b6d4"
                    initial={{ cx: 0, cy: 60, opacity: 0 }}
                    animate={{ cx: [0, 48, 96], cy: [60, 70, 80], opacity: [0, 1, 1] }}
                    exit={{ opacity: 0, scale: 2 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                  />
                )}
              </AnimatePresence>
              {/* the blocked bot */}
              <AnimatePresence>
                {botCaught && !reduce && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <motion.circle
                      r="5"
                      fill="#f43f5e"
                      initial={{ cx: 0, cy: 100 }}
                      animate={{ cx: [0, 40, 44], cy: [100, 90, 88], scale: [1, 1, 0] }}
                      transition={{ duration: 0.9, ease: 'easeIn' }}
                    />
                    <motion.g
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: [0, 1, 1, 0], scale: [0.6, 1.15, 1, 0.9] }}
                      transition={{ duration: 1.6, times: [0, 0.3, 0.8, 1], delay: 0.55 }}
                    >
                      <circle cx="48" cy="88" r="13" fill="#fff1f2" stroke="#fda4af" strokeWidth="1.5" />
                      <path d="M48 82 l5 2.4 v3.6 c0 3.4 -2.1 5.6 -5 6.8 c-2.9 -1.2 -5 -3.4 -5 -6.8 v-3.6 z" fill="#f43f5e" />
                    </motion.g>
                  </motion.g>
                )}
              </AnimatePresence>
            </svg>
          </div>

          {/* ---------------- The inbox (owner side) ---------------- */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-6 text-white shadow-2xl">
            <div aria-hidden className="pointer-events-none absolute -top-20 right-0 h-40 w-64 rounded-full bg-cyan-500/15 blur-[80px]" />
            <div className="relative mb-4 flex items-center justify-between">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                <Inbox className="h-3.5 w-3.5" /> Your Inlet inbox
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> LIVE
              </span>
            </div>

            <div className="relative space-y-2.5">
              <AnimatePresence initial={false}>
                {leads.map((l, i) => (
                  <motion.div
                    key={l.id}
                    layout
                    initial={{ opacity: 0, x: -28, scale: 0.96 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                    className={`rounded-2xl border p-4 ${i === 0 && l.id !== 1 ? 'border-cyan-500/40 bg-cyan-500/10' : 'border-white/10 bg-white/5'}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-bold">{l.name}</p>
                      {i === 0 && l.id !== 1 && (
                        <span className="shrink-0 rounded-full bg-cyan-400 px-2 py-0.5 text-[10px] font-bold text-slate-950">NEW</span>
                      )}
                    </div>
                    <p className="truncate text-xs text-slate-400">{l.email}</p>
                    <p className="mt-1.5 truncate text-xs text-slate-300">{l.message}</p>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* auto-reply confirmation */}
              <AnimatePresence>
                {autoReplyTo && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-2.5 text-xs text-emerald-300"
                  >
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    Branded auto-reply sent to <span className="truncate font-semibold">{autoReplyTo}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* live counters */}
            <div className="relative mt-5 grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/5 py-3 text-center">
              {[
                { label: 'Leads', value: leads.filter((l) => l.id !== 1).length + 1 },
                { label: 'Spam blocked', value: blocked },
                { label: 'Auto-replies', value: replies },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-lg font-extrabold tabular-nums text-white">{s.value}</p>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Interactive simulation of the live pipeline — nothing you type here is sent or stored.
        </p>
      </div>
    </section>
  );
}
