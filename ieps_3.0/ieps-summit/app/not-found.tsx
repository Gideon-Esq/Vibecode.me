import type { Metadata } from "next";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-navy px-5 py-28 text-center text-white">
      <div className="absolute inset-0 bg-hero-aurora" aria-hidden />
      <div className="absolute inset-0 bg-dots opacity-40" aria-hidden />
      <div
        className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-green/20 blur-3xl"
        aria-hidden
      />
      <div
        className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-gold/15 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 max-w-lg">
        <p className="heading-display text-7xl leading-none text-gold sm:text-8xl lg:text-9xl">
          404
        </p>
        <h1 className="mt-4 font-display text-2xl font-bold sm:text-3xl">
          This page doesn&apos;t exist yet, but the summit does.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-pretty text-white/70">
          The page you&apos;re looking for may have moved or never existed.
          Let&apos;s get you back on track.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/" size="lg">
            <Home className="h-5 w-5" />
            Back to Home
          </Button>
          <Button href="/register" variant="outline" size="lg">
            <ArrowLeft className="h-5 w-5" />
            Register for IEPS 3.0
          </Button>
        </div>
      </div>
    </section>
  );
}
