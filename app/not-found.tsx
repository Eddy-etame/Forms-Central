import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NavBar, SiteFooter } from "@/components/marketing/NavBar";
import { Magnetic } from "@/components/marketing/Interactive";
import { getLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";

export default async function NotFound() {
  const locale = await getLocale();
  const t = getDictionary(locale).notFoundPage;
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <NavBar locale={locale} />
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <p className="font-mono text-sm font-semibold text-blue-600">{t.kicker}</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
          {t.title}
        </h1>
        <p className="mt-4 max-w-md text-slate-600">
          {t.subtitle}
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Magnetic>
            <Link href="/" className="btn-shine inline-flex h-11 items-center gap-2 rounded-full bg-slate-900 px-6 text-sm font-medium text-white transition-all duration-300 hover:bg-slate-800 hover:shadow-lg hover:shadow-blue-500/20">
              {t.backHome} <ArrowRight className="cta-arrow h-4 w-4" />
            </Link>
          </Magnetic>
          <Link href="/docs" className="link-underline inline-flex h-11 items-center px-2 text-sm font-medium text-slate-800">
            {t.readDocs}
          </Link>
        </div>
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
