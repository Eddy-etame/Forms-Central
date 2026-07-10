import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** Shared marketing nav — used by every public page (multi-page site). */
export function NavBar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 font-bold text-white shadow-sm">K</div>
          <span className="font-semibold tracking-tight text-slate-900">King E Forms</span>
        </Link>
        <div className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
          <Link href="/#features" className="hover:text-slate-900 transition-colors">Features</Link>
          <Link href="/#how" className="hover:text-slate-900 transition-colors">How it works</Link>
          <Link href="/docs" className="hover:text-slate-900 transition-colors">Docs</Link>
          <Link href="/pricing" className="hover:text-slate-900 transition-colors">Pricing</Link>
          <Link href="/#faq" className="hover:text-slate-900 transition-colors">FAQ</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/client/login" className="hidden text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors sm:block">Sign in</Link>
          <Link href="/client/signup" className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 transition-colors">
            Get started <ArrowRight className="h-3.5 w-3.5" />
          </Link>
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
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">K</div>
          <span className="font-semibold text-slate-800">King E Forms</span>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <Link href="/#features" className="hover:text-slate-900 transition-colors">Features</Link>
          <Link href="/docs" className="hover:text-slate-900 transition-colors">Docs</Link>
          <Link href="/pricing" className="hover:text-slate-900 transition-colors">Pricing</Link>
          <Link href="/compare/formspree" className="hover:text-slate-900 transition-colors">vs Formspree</Link>
          <Link href="/compare/jotform" className="hover:text-slate-900 transition-colors">vs Jotform</Link>
          <Link href="/client/login" className="hover:text-slate-900 transition-colors">Sign in</Link>
        </nav>
        <p>&copy; {new Date().getFullYear()} King E Forms</p>
      </div>
    </footer>
  );
}
