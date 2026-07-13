import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Playfair_Display, Inter } from "next/font/google";
import "@/styles/globals.css";
import { ConditionalNavbar, ConditionalFooter } from "@/components/layout/Chrome";
import { TopProgressBar } from "@/components/ui/TopProgressBar";
import { SITE_URL, EVENT } from "@/lib/constants";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "IEPS 3.0 | Ife Education Parliamentary Summit 2026",
    template: "%s | IEPS 3.0",
  },
  description:
    "Join the Ife Education Parliamentary Summit 3.0 on July 22, 2026 at OAU. Nigerian Parliamentarian: A Strategic Panacea for Nation-Building and Education Reforms.",
  keywords: [
    "IEPS",
    "Ife Education Parliamentary Summit",
    "OAU",
    "ESRC",
    "education summit Nigeria",
    "parliamentary summit 2026",
  ],
  authors: [{ name: "ESRC, OAU" }],
  alternates: { canonical: "/" },
  openGraph: {
    title: "IEPS 3.0 | Ife Education Parliamentary Summit",
    description: `July 22, 2026 | ${EVENT.venue.shortName}`,
    type: "website",
    locale: "en_NG",
    url: SITE_URL,
    siteName: "IEPS 3.0",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "IEPS 3.0 | Ife Education Parliamentary Summit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IEPS 3.0 | 22nd July 2026 | OAU",
    description: `July 22, 2026 | ${EVENT.venue.shortName}`,
    images: ["/opengraph-image.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0D1B5E",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable}`}
    >
      <body className="min-h-dvh font-body">
        {/* Skip link for keyboard / screen-reader users */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-navy focus:px-4 focus:py-2 focus:font-semibold focus:text-gold"
        >
          Skip to content
        </a>
        <TopProgressBar />
        <ConditionalNavbar />
        <main id="main">{children}</main>
        <ConditionalFooter />

        {/* Google Analytics (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-G1REM8XSFT"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-G1REM8XSFT');
          `}
        </Script>
      </body>
    </html>
  );
}
