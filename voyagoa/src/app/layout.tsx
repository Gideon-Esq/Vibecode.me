import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { Footer } from "@/components/footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Google Material Symbols (variable, FILL axis), self-hosted
const materialSymbols = localFont({
  src: "../fonts/material-symbols-outlined.woff2",
  variable: "--font-material",
  display: "block", // icons flash as raw ligature text with `swap`
  preload: true,
});

export const metadata: Metadata = {
  title: "Voyagoa — AI Travel Planner",
  description:
    "Tell Voyagoa your budget and available days. Voyagoa plans the entire journey — flights, hotels, food, visas and a day-by-day itinerary.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${materialSymbols.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
