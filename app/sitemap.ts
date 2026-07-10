import type { MetadataRoute } from "next";

const SITE_URL = "https://forms-central-h1ee.vercel.app";

// Only list routes that actually exist (404s in a sitemap hurt SEO).
// Grow this list as marketing pages ship (/pricing, /docs, /compare/*, …).
const ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/pricing", priority: 0.9, changeFrequency: "weekly" },
  { path: "/docs", priority: 0.9, changeFrequency: "weekly" },
  { path: "/compare/formspree", priority: 0.8, changeFrequency: "monthly" },
  { path: "/compare/jotform", priority: 0.8, changeFrequency: "monthly" },
  { path: "/client/signup", priority: 0.6, changeFrequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
