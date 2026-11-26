import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep app internals out of the index; marketing pages stay crawlable.
        // The operator area is deliberately absent: it answers like any missing
        // page to everyone else and carries its own noindex — a public list of
        // "do not look here" paths is the one place that would point at it.
        disallow: ["/api/", "/developer/dashboard", "/developer/choose-plan", "/portal"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
