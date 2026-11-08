import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { NavBar, SiteFooter } from '@/components/marketing/NavBar';
import { resolveLocale, buildMetadata } from '@/lib/seo';
import { getLegal, isLegalDoc } from '@/lib/legal';

type Props = { params: Promise<{ doc: string }>; searchParams: Promise<{ lang?: string }> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { doc } = await params;
  const { lang } = await searchParams;
  if (!isLegalDoc(doc)) return {};
  return buildMetadata(doc, await resolveLocale(lang));
}

/** Replaces {contact} with a mailto link (or a plain fallback when no address is configured). */
function withContact(text: string, contact: string, fallback: string): ReactNode {
  const parts = text.split('{contact}');
  if (parts.length === 1) return text;
  return parts.flatMap((part, i) =>
    i === 0
      ? [part]
      : [
          contact ? (
            <a key={i} href={`mailto:${contact}`} className="link-underline font-semibold text-slate-900">{contact}</a>
          ) : (
            <span key={i}>{fallback}</span>
          ),
          part,
        ],
  );
}

export default async function LegalPage({ params, searchParams }: Props) {
  const { doc } = await params;
  const { lang } = await searchParams;
  if (!isLegalDoc(doc)) notFound();
  const locale = await resolveLocale(lang);
  const docs = getLegal(locale);
  const d = docs[doc];
  const other = doc === 'privacy' ? 'terms' : 'privacy';
  // The address published on the legal pages: LEGAL_CONTACT_EMAIL when set, else the operator's address.
  const contact = (process.env.LEGAL_CONTACT_EMAIL || process.env.OPERATOR_EMAIL || '').trim();
  const fallback = locale === 'fr' ? 'l’adresse de contact indiquée dans votre tableau de bord' : 'the contact address shown in your dashboard';
  const t = (s: string) => withContact(s, contact, fallback);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <NavBar locale={locale} />
      <main className="mx-auto max-w-3xl px-6 py-16 lg:py-20">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-slate-500">{d.kicker}</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">{d.title}</h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">{d.lead}</p>
        <p className="mt-3 text-sm text-slate-500">{d.updatedLabel} {d.updated}</p>

        <nav aria-label={d.kicker} className="mt-10 rounded-2xl border border-slate-200 bg-slate-50/60 p-5 text-sm">
          <ol className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {d.sections.map((s, i) => (
              <li key={s.h}>
                <a href={`#s${i + 1}`} className="link-underline text-slate-700 hover:text-slate-900">
                  <span className="mr-2 font-mono text-xs text-slate-400">{String(i + 1).padStart(2, '0')}</span>{s.h}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-12 space-y-12">
          {d.sections.map((s, i) => (
            <section key={s.h} id={`s${i + 1}`} className="scroll-mt-24">
              <h2 className="text-xl font-bold tracking-tight">
                <span className="mr-3 font-mono text-sm text-gold-dim">{String(i + 1).padStart(2, '0')}</span>{s.h}
              </h2>
              {s.p?.map((text) => <p key={text} className="mt-3 leading-7 text-slate-600">{t(text)}</p>)}
              {s.ul && (
                <ul className="mt-3 list-disc space-y-2 pl-5 leading-7 text-slate-600 marker:text-gold">
                  {s.ul.map((text) => <li key={text}>{t(text)}</li>)}
                </ul>
              )}
            </section>
          ))}
        </div>

        <p className="mt-14 border-t border-slate-100 pt-6 text-sm text-slate-500">
          {d.seeAlso}{' '}
          <Link href={`/legal/${other}?lang=${locale}`} className="link-underline font-semibold text-slate-900">{docs[other].title}</Link>
        </p>
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
