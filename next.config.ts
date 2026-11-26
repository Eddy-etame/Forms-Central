import type { NextConfig } from "next";
import { staticCsp } from "./lib/csp";

/**
 * Security headers.
 *
 * Content-Security-Policy comes from two places that never overlap
 * (lib/csp.ts explains both):
 *  - pages: proxy.ts, a policy built around a nonce minted per request;
 *  - everything the proxy does not see — the API, /_next, any path with a
 *    dot: the fixed policy below.
 * The three `source` patterns for the fixed policy are the exact complement
 * of the proxy's page test, so no response ever carries two policies.
 *
 * 'unsafe-eval' is added in DEVELOPMENT ONLY — React/Turbopack dev mode uses
 * eval() for fast-refresh + callstack reconstruction. React never uses eval()
 * in production, so the production policies carry no eval.
 */
const isDev = process.env.NODE_ENV === "development";

const fixedCsp = [{ key: "Content-Security-Policy", value: staticCsp(isDev) }];

const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Cross-origin hardening. COOP is popup-safe (keeps OAuth popups working for
  // the planned Google sign-in); CORP is intentionally NOT set globally so
  // social scrapers can still fetch the OG image.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
];

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  // Pin the workspace root — a stray lockfile in the home dir was making Next
  // infer the wrong root.
  outputFileTracingRoot: process.cwd(),
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      { source: "/api/:path+", headers: fixedCsp },
      { source: "/_next/:path+", headers: fixedCsp },
      { source: "/:path(.*\\..*)", headers: fixedCsp },
    ];
  },
  // The developer workspace moved from /client/* to /developer/* (the word
  // "client" now means the businesses a developer builds for). Old links in
  // e-mails and bookmarks keep working.
  async redirects() {
    return [
      { source: "/client/dashboard/developer", destination: "/developer/dashboard/api", permanent: true },
      { source: "/client/:path*", destination: "/developer/:path*", permanent: true },
      { source: "/compare/:slug*", destination: "/docs", permanent: true },
    ];
  },
};

export default nextConfig;
