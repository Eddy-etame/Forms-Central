import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NavBar, SiteFooter } from "@/components/marketing/NavBar";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <NavBar />
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <p className="font-mono text-sm font-semibold text-blue-600">404</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
          This page didn&apos;t submit.
        </h1>
        <p className="mt-4 max-w-md text-slate-600">
          The address doesn&apos;t exist (or was caught by our spam filter — kidding).
          Let&apos;s get you back to solid ground.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link href="/" className="inline-flex h-11 items-center gap-2 rounded-full bg-slate-900 px-6 text-sm font-medium text-white hover:bg-slate-800 transition-colors">
            Back home <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/docs" className="inline-flex h-11 items-center rounded-full border border-slate-200 px-6 text-sm font-medium text-slate-800 hover:border-slate-300 transition-colors">
            Read the docs
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
