import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Only list routes that actually exist (404s in a sitemap hurt SEO).
// Grow this list as marketing pages ship (/pricing, /docs, …).
const ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/pricing", priority: 0.9, changeFrequency: "weekly" },
  { path: "/docs", priority: 0.9, changeFrequency: "weekly" },
  { path: "/developer/signup", priority: 0.6, changeFrequency: "monthly" },
];

// Pages served in both languages — declare the fr/en alternates so Google
// indexes each language version (Inlet ranks for "form backend" AND
// "backend de formulaire").
const BILINGUAL = new Set(["/", "/pricing", "/docs"]);

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const out: MetadataRoute.Sitemap = [];
  for (const r of ROUTES) {
    const base = `${SITE_URL}${r.path === "/" ? "" : r.path}`;
    if (BILINGUAL.has(r.path)) {
      // Each language URL is its own canonical (buildMetadata), so list both,
      // each pointing at the other — never the bare URL, whose canonical would
      // be whichever language the crawler's country resolved to.
      const languages = { en: `${base}?lang=en`, fr: `${base}?lang=fr`, "x-default": base || SITE_URL };
      for (const lang of ["en", "fr"] as const) {
        out.push({ url: `${base}?lang=${lang}`, lastModified: now, changeFrequency: r.changeFrequency, priority: r.priority, alternates: { languages } });
      }
    } else {
      out.push({ url: `${SITE_URL}${r.path}`, lastModified: now, changeFrequency: r.changeFrequency, priority: r.priority });
    }
  }
  return out;
}
