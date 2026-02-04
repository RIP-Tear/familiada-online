import "../styles/index.scss";
import { ReactNode } from "react";
import Script from "next/script";
import ClientLayout from "../components/ClientLayout";
import type { Metadata, Viewport } from "next";

interface RootLayoutProps {
  children: ReactNode;
}

// Metadata base URL
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.familiada-online.pl';

// Metadata Configuration (Next.js 14+)
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Familiada Online - Gra Familijna Za Darmo | Multiplayer Po Polsku",
    template: "%s | Familiada Online"
  },
  description: "Familiada Online - gra familijna za darmo! Multiplayer po polsku z własnymi pytaniami. Graj na telefon lub komputer. Tablica online, buzzer i rozgrywka jak w teleturnieju. Familiada gra online za darmo!",
  keywords: [
    "familiada",
    "familiada online",
    "familiada gra online",
    "familiada gra",
    "gra familiada online",
    "familiada online gra",
    "familiada gra online za darmo",
    "familiada gra za darmo",
    "familiada gra na telefon",
    "familiada tablica online",
    "familiada online multiplayer",
    "gra familijna online",
    "familiada online własne pytania",
    "gry familiada",
    "familiada gra online po polsku",
    "familiada w domu",
    "gra online",
    "multiplayer",
    "teleturniej",
    "quiz online",
    "gra grupowa",
    "gra rodzinna",
    "teleturniej online",
    "gry towarzyskie",
    "gry imprezowe",
    "gry rodzinne online",
    "za darmo",
    "po polsku"
  ],
  authors: [{ name: "Familiada Online" }],
  creator: "Familiada Online",
  publisher: "Familiada Online",
  applicationName: "Familiada Online",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  
  // Open Graph
  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: siteUrl,
    siteName: "Familiada Online",
    title: "Familiada Online - Gra Familijna Za Darmo | Multiplayer Po Polsku",
    description: "Familiada gra online za darmo! Multiplayer z własnymi pytaniami, graj na telefon lub komputer. Tablica online jak w teleturnieju. Bez pobierania - graj w przeglądarce!",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Familiada Online - Klasyczna gra teleturniejna",
      },
    ],
  },
  
  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "Familiada Online - Gra Familijna Za Darmo | Multiplayer Po Polsku",
    description: "Familiada gra online za darmo! Multiplayer z własnymi pytaniami, graj na telefon lub komputer. Tablica online jak w teleturnieju. Bez pobierania - graj w przeglądarce!",
    images: [`${siteUrl}/og-image.png`],
  },
  
  // Icons & Manifest
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  // Verification
  verification: {
    google: "BFOu5J4qV2n1ircNWrqUuqCxtZxx75czOqBrke8_GSE",
  },
  
  // Google AdSense Verification
  other: {
    "google-adsense-account": "ca-pub-2764762981727603",
  },
  
  // Alternates
  alternates: {
    canonical: siteUrl,
  },
  
  // Additional metadata
  category: "Games",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#264653",
};

export default function RootLayout({ children }: RootLayoutProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Familiada Online",
    "alternateName": ["Familiada - Gra Familijna", "Familiada Gra Online", "Gra Familiada Online", "Familiada Multiplayer"],
    "url": siteUrl,
    "description": "Familiada gra online za darmo! Multiplayer po polsku z własnymi pytaniami, graj na telefon lub komputer. Tablica online jak w teleturnieju. Bez pobierania!",
    "applicationCategory": "Game",
    "operatingSystem": "Any",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "PLN",
      "availability": "https://schema.org/InStock"
    },
    "featureList": "multiplayer online, własne pytania, gra na telefon, tablica online, gra za darmo, po polsku, bez rejestracji, bez pobierania",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "150",
      "bestRating": "5",
      "worstRating": "1"
    },
    "inLanguage": "pl-PL",
    "author": {
      "@type": "Organization",
      "name": "Familiada Online",
      "url": siteUrl
    },
    "publisher": {
      "@type": "Organization",
      "name": "Familiada Online",
      "url": siteUrl
    },
    "keywords": "familiada online, familiada gra online, familiada gra, gra familiada online, familiada gra za darmo, familiada online multiplayer, gra familijna online, własne pytania, na telefon, po polsku, za darmo, bez pobierania, tablica online",
    "image": `${siteUrl}/og-image.png`,
    "screenshot": `${siteUrl}/og-image.png`
  };

  return (
    <html lang="pl">
      <head>
        <link rel="author" href="/humans.txt" />
      </head>
      <body>
        {/* Structured Data */}
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          strategy="beforeInteractive"
        />
        
        {/* Google AdSense */}
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-XXXXXXXXXXXXXXXXX'}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        
        {/* Google Analytics - opcjonalnie */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
        
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
