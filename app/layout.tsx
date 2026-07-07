import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Swap this to your custom domain when you buy it — every canonical, OG, and
// sitemap URL derives from it.
const SITE_URL = "https://logiciel-formulaire.vercel.app";
const SITE_NAME = "King E Forms";
const TAGLINE = "One form backend for all your websites";
const DESCRIPTION =
  "The self-hosted form backend that centralizes submissions from all your sites into one dashboard — no SMTP, no per-site setup. White-labeled auto-reply emails, AI + proof-of-work spam blocking, CSV exports. A privacy-first alternative to Formspree, Jotform and Basin.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "form backend",
    "form API",
    "form microservice",
    "Formspree alternative",
    "Jotform alternative",
    "Basin alternative",
    "self-hosted forms",
    "contact form backend",
    "form without backend",
    "form without SMTP",
    "centralized form submissions",
    "multi-tenant forms",
    "white-label form emails",
    "static site form handler",
    "Astro form backend",
    "Next.js form backend",
    "HTML form to email",
    "form spam protection",
    "proof of work anti-spam",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "technology",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${TAGLINE}`,
    description: DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — ${TAGLINE}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${TAGLINE}`,
    description: DESCRIPTION,
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
  },
  // Fill these once you verify the property (Google Search Console + Bing
  // Webmaster — Bing indexing is required for ChatGPT citations).
  verification: {
    // google: "your-google-site-verification",
    other: {
      // "msvalidate.01": "your-bing-verification",
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
