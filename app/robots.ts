import type { MetadataRoute } from "next";

const SITE_URL = "https://forms-central-h1ee.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep app internals out of the index; marketing pages stay crawlable.
        disallow: ["/admin", "/api/", "/client", "/login"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
