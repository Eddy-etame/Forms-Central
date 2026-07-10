'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MessageCircle, X, Send, Sparkles, Lock } from 'lucide-react';

type Msg = { role: 'user' | 'assistant'; content: string };

const STARTERS = [
  'Do I need SMTP on my website?',
  'How do I integrate it with Next.js?',
  'How does spam protection work?',
];

export default function AiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [paywalled, setPaywalled] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy, paywalled]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy || paywalled) return;
    setError('');
    const next: Msg[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setBusy(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.slice(-12) }),
      });
      const data = await res.json();
      if (res.status === 402) {
        setPaywalled(true);
      } else if (res.ok && data.text) {
        setMessages((m) => [...m, { role: 'assistant', content: data.text }]);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Could not reach the assistant. Check your connection.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close assistant' : 'Ask the Formdock assistant'}
        className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-xl transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Formdock AI assistant"
          className="fixed bottom-24 right-5 z-[60] flex h-[540px] w-[min(400px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-950 px-5 py-4 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
              <Sparkles className="h-4.5 w-4.5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">Formdock Assistant</p>
              <p className="text-xs text-slate-400">Integration help, answered instantly</p>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 && !paywalled && (
              <div className="space-y-3">
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 text-sm text-slate-800">
                  Hi! Ask me anything about Formdock — integration, spam protection, plans.
                </div>
                <div className="flex flex-wrap gap-2">
                  {STARTERS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === 'user'
                    ? 'ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-slate-900 px-4 py-3 text-sm text-white'
                    : 'max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 text-sm text-slate-800'
                }
              >
                {m.content}
              </div>
            ))}

            {busy && (
              <div className="flex max-w-[85%] items-center gap-1.5 rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3.5">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:120ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:240ms]" />
              </div>
            )}

            {paywalled && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900">
                  <Lock className="h-4.5 w-4.5 text-white" />
                </div>
                <p className="text-sm font-semibold text-slate-900">That was your free message</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Pro includes unlimited AI assistance, white-label emails, CSV export and analytics.
                </p>
                <Link
                  href="/pricing"
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                >
                  See Pro plans
                </Link>
              </div>
            )}

            {error && (
              <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>
            )}
          </div>

          {/* Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-slate-100 p-3"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={paywalled ? 'Upgrade to keep chatting' : 'Ask a question…'}
              disabled={busy || paywalled}
              maxLength={2000}
              className="h-11 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm outline-none placeholder:text-slate-400 focus:border-slate-400 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={busy || paywalled || !input.trim()}
              aria-label="Send"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-white transition-opacity disabled:opacity-40"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
