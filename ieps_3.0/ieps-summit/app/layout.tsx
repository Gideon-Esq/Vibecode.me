import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, Barlow_Condensed } from "next/font/google";
import "@/styles/globals.css";
import { ConditionalNavbar, ConditionalFooter } from "@/components/layout/Chrome";
import { TopProgressBar } from "@/components/ui/TopProgressBar";
import { SITE_URL } from "@/lib/constants";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "IEPS 3.0 | Ife Education Parliamentary Summit 2026",
    template: "%s | IEPS 3.0",
  },
  description:
    "Join the Ife Education Parliamentary Summit 3.0 on July 22, 2026 at OAU. Nigerian Parliamentarians: A Strategic Panacea for Nation Building and Educational Reform.",
  keywords: [
    "IEPS",
    "Ife Education Parliamentary Summit",
    "OAU",
    "ESRC",
    "ESAN",
    "education summit Nigeria",
    "parliamentary summit 2026",
  ],
  authors: [{ name: "ESRC, OAU" }],
  alternates: { canonical: "/" },
  openGraph: {
    title: "IEPS 3.0 — Ife Education Parliamentary Summit",
    description: "July 22, 2026 | African Centre of Excellence, OAU",
    type: "website",
    locale: "en_NG",
    url: SITE_URL,
    siteName: "IEPS 3.0",
  },
  twitter: {
    card: "summary_large_image",
    title: "IEPS 3.0 | 22nd July 2026 | OAU",
    description: "July 22, 2026 | African Centre of Excellence, OAU",
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
      className={`${spaceGrotesk.variable} ${inter.variable} ${barlowCondensed.variable}`}
    >
      <body className="min-h-dvh font-body">
        {/* Skip link for keyboard / screen-reader users */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-gold focus:px-4 focus:py-2 focus:font-semibold focus:text-navy"
        >
          Skip to content
        </a>
        <TopProgressBar />
        <ConditionalNavbar />
        <main id="main">{children}</main>
        <ConditionalFooter />
      </body>
    </html>
  );
}
