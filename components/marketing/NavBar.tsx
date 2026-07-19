import Link from "next/link";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import { getLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { LogoBadge } from "@/components/Logo";
import { Magnetic } from "@/components/marketing/Interactive";
import { MobileMenu } from "@/components/marketing/MobileMenu";
import { LanguageToggle } from "@/components/marketing/LanguageToggle";

/** Is there a valid client session? Lets the marketing nav stay coherent for
 *  signed-in subscribers (no more "Sign in / Get started" — and the feeling of
 *  being logged out — when they open /pricing from inside the dashboard). */
async function hasClientSession(): Promise<boolean> {
  try {
    const token = (await cookies()).get('client_access_token')?.value;
    const secret = process.env.JWT_SECRET;
    if (!token || !secret) return false;
    const payload = await verifyJWT(token, secret);
    return !!payload && payload.sub === 'client';
  } catch {
    return false;
  }
}

/** Shared marketing nav — used by every public page (multi-page site).
 *  `variant="dark"` sits on the dark hero (landing); default stays light. */
export async function NavBar({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const dark = variant === 'dark';
  const [signedIn, locale] = await Promise.all([hasClientSession(), getLocale()]);
  const t = getDictionary(locale).nav;
  return (
    <nav className={`sticky top-0 z-50 border-b backdrop-blur-xl ${dark ? 'border-white/5 bg-slate-950' : 'border-slate-200/70 bg-white/80'}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <LogoBadge className="h-8 w-8 rounded-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />
          <span className={`font-semibold tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>Inlet</span>
        </Link>
        <div className={`hidden items-center gap-8 text-sm md:flex ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
          <Link href="/#features" className={`link-underline transition-colors ${dark ? 'hover:text-white' : 'hover:text-slate-900'}`}>{t.features}</Link>
          <Link href="/#how" className={`link-underline transition-colors ${dark ? 'hover:text-white' : 'hover:text-slate-900'}`}>{t.how}</Link>
          <Link href="/docs" className={`link-underline transition-colors ${dark ? 'hover:text-white' : 'hover:text-slate-900'}`}>{t.docs}</Link>
          <Link href="/pricing" className={`link-underline transition-colors ${dark ? 'hover:text-white' : 'hover:text-slate-900'}`}>{t.pricing}</Link>
          <Link href="/#faq" className={`link-underline transition-colors ${dark ? 'hover:text-white' : 'hover:text-slate-900'}`}>{t.faq}</Link>
        </div>
        <div className="flex items-center gap-3">
          <LanguageToggle locale={locale} dark={dark} />
          {signedIn ? (
            <Magnetic strength={0.2}>
              <Link
                href="/client/dashboard"
                className={`btn-shine inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium shadow-sm transition-all duration-300 ${
                  dark
                    ? 'btn-shine-soft bg-white text-slate-900 hover:bg-slate-100 hover:shadow-md hover:shadow-white/20'
                    : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-md hover:shadow-blue-500/20'
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5" /> {t.dashboard}
              </Link>
            </Magnetic>
          ) : (
            <>
              <Link href="/client/login" className={`link-underline hidden text-sm font-medium transition-colors sm:block ${dark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>{t.signIn}</Link>
              <Magnetic strength={0.2}>
                <Link
                  href="/client/signup"
                  className={`btn-shine hidden items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium shadow-sm transition-all duration-300 sm:inline-flex ${
                    dark
                      ? 'btn-shine-soft bg-white text-slate-900 hover:bg-slate-100 hover:shadow-md hover:shadow-white/20'
                      : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-md hover:shadow-blue-500/20'
                  }`}
                >
                  {t.getStarted} <ArrowRight className="cta-arrow h-3.5 w-3.5" />
                </Link>
              </Magnetic>
            </>
          )}
          <MobileMenu dark={dark} />
        </div>
      </div>
    </nav>
  );
}

/** Shared marketing footer. */
export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 text-sm text-slate-500 sm:flex-row lg:px-8">
        <div className="flex items-center gap-2.5">
          <LogoBadge className="h-7 w-7 rounded-lg" />
          <span className="font-semibold text-slate-800">Inlet</span>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <Link href="/#features" className="link-underline hover:text-slate-900 transition-colors">Features</Link>
          <Link href="/docs" className="link-underline hover:text-slate-900 transition-colors">Docs</Link>
          <Link href="/pricing" className="link-underline hover:text-slate-900 transition-colors">Pricing</Link>
          <Link href="/compare/formspree" className="link-underline hover:text-slate-900 transition-colors">vs Formspree</Link>
          <Link href="/compare/jotform" className="link-underline hover:text-slate-900 transition-colors">vs Jotform</Link>
          <Link href="/client/login" className="link-underline hover:text-slate-900 transition-colors">Sign in</Link>
        </nav>
        <p>
          &copy; {new Date().getFullYear()} Inlet
          <span className="ml-2 text-slate-300">&middot;</span>
          <span className="ml-2 text-xs text-slate-400">by King_E</span>
        </p>
      </div>
    </footer>
  );
}
