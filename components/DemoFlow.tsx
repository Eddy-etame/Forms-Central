'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { FileText, ShieldCheck, Inbox, Mail, Bot } from 'lucide-react';

/**
 * Animated product demo: a real lead travels form -> spam gates -> inbox
 * (and triggers the branded auto-reply); then a bot packet is blocked at
 * the shield. Motion communicates the actual pipeline, on an 8s loop.
 */

const LOOP = 8; // seconds

// keyframe times (fractions of the loop)
const T = {
  leadStart: 0.02,
  leadAtShield: 0.22,
  leadPass: 0.3,
  leadAtInbox: 0.48,
  inboxPop: 0.5,
  botStart: 0.6,
  botAtShield: 0.78,
  botBlocked: 0.84,
  end: 1,
};

function Stage({
  icon: Icon,
  title,
  caption,
  highlight,
}: {
  icon: React.ElementType;
  title: string;
  caption: string;
  highlight: { scale: number[]; times: number[] };
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      animate={reduce ? undefined : { scale: highlight.scale }}
      transition={reduce ? undefined : { duration: LOOP, repeat: Infinity, times: highlight.times, ease: 'easeOut' }}
      className="relative z-10 flex w-40 flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
        <Icon className="h-5 w-5 text-slate-700" />
      </div>
      <p className="text-sm font-bold text-slate-900">{title}</p>
      <p className="text-xs leading-snug text-slate-500">{caption}</p>
    </motion.div>
  );
}

export default function DemoFlow() {
  const reduce = useReducedMotion();

  return (
    <section id="demo" className="border-y border-slate-100 bg-slate-50/60 py-20" aria-label="Live demo of how a submission flows">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Watch a lead arrive</h2>
          <p className="mt-4 text-lg text-slate-600">
            A real submission passes the gates and lands in your inbox — a bot doesn&apos;t.
          </p>
        </div>

        {/* Desktop pipeline */}
        <div className="relative hidden items-center justify-between md:flex">
          {/* track */}
          <div aria-hidden className="absolute left-20 right-20 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />

          {!reduce && (
            <>
              {/* legit lead packet */}
              <motion.div
                aria-hidden
                className="absolute top-1/2 z-20 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-blue-500 shadow-[0_0_14px_rgba(59,130,246,0.8)]"
                animate={{
                  left: ['9%', '9%', '48%', '48%', '86%', '86%', '86%'],
                  opacity: [0, 1, 1, 1, 1, 0, 0],
                  scale: [0.6, 1, 1, 1.15, 1, 0.6, 0.6],
                }}
                transition={{
                  duration: LOOP,
                  repeat: Infinity,
                  times: [0, T.leadStart, T.leadAtShield, T.leadPass, T.leadAtInbox, T.inboxPop + 0.04, 1],
                  ease: 'easeInOut',
                }}
              />
              {/* bot packet — stopped at the shield */}
              <motion.div
                aria-hidden
                className="absolute top-1/2 z-20 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-rose-500 shadow-[0_0_14px_rgba(244,63,94,0.8)]"
                animate={{
                  left: ['9%', '9%', '46%', '46%', '46%'],
                  opacity: [0, 1, 1, 0, 0],
                  scale: [0.6, 1, 1, 1.6, 0],
                }}
                transition={{
                  duration: LOOP,
                  repeat: Infinity,
                  times: [T.botStart - 0.02, T.botStart, T.botAtShield, T.botBlocked, 1],
                  ease: 'easeInOut',
                }}
              >
                <Bot className="h-3 w-3 text-white" />
              </motion.div>
            </>
          )}

          <Stage
            icon={FileText}
            title="Your form"
            caption="Any site, any framework — two env values"
            highlight={{ scale: [1, 1.04, 1, 1, 1, 1.04, 1, 1], times: [0, T.leadStart, 0.1, 0.5, T.botStart - 0.02, T.botStart, 0.7, 1] }}
          />
          <Stage
            icon={ShieldCheck}
            title="Spam gates"
            caption="Honeypot · proof-of-work · NLP · rDNS"
            highlight={{ scale: [1, 1, 1.06, 1, 1, 1.1, 1, 1], times: [0, T.leadAtShield - 0.02, T.leadPass, T.leadPass + 0.08, T.botAtShield - 0.02, T.botBlocked, T.botBlocked + 0.08, 1] }}
          />
          <Stage
            icon={Inbox}
            title="Your dashboard"
            caption="Every site's leads, centralized live"
            highlight={{ scale: [1, 1, 1.08, 1, 1], times: [0, T.leadAtInbox, T.inboxPop, T.inboxPop + 0.1, 1] }}
          />
        </div>

        {/* Mobile: vertical stages, no traveling packets */}
        <div className="grid gap-3 md:hidden">
          {[
            { icon: FileText, t: 'Your form', c: 'Any site, any framework — two env values' },
            { icon: ShieldCheck, t: 'Spam gates', c: 'Honeypot · proof-of-work · NLP · rDNS — bots stop here' },
            { icon: Inbox, t: 'Your dashboard', c: 'Every site’s leads, centralized live' },
          ].map((s, i) => (
            <motion.div
              key={s.t}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.12, duration: 0.45 }}
              className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                <s.icon className="h-5 w-5 text-slate-700" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{s.t}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{s.c}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* outcome row */}
        <div className="mx-auto mt-10 flex max-w-xl items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-600">
          <Mail className="h-4.5 w-4.5 shrink-0 text-blue-600" />
          <p>
            …and the submitter instantly receives an auto-reply in <strong className="text-slate-900">your client&apos;s branding</strong> — logo, colors, sender name.
          </p>
        </div>
      </div>
    </section>
  );
}
