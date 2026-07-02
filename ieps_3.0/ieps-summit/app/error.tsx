"use client";

import { useEffect } from "react";
import { RotateCcw, Home, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error for logging/observability.
    console.error(error);
  }, [error]);

  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-navy px-5 py-28 text-center text-white">
      <div className="absolute inset-0 bg-hero-aurora" aria-hidden />
      <div className="absolute inset-0 bg-dots opacity-40" aria-hidden />
      <div
        className="absolute -right-24 top-10 h-80 w-80 rounded-full bg-gold/15 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 max-w-lg">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gold/15 text-gold">
          <AlertTriangle className="h-8 w-8" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-bold sm:text-4xl">
          Something went wrong
        </h1>
        <p className="mx-auto mt-4 max-w-md text-pretty text-white/70">
          An unexpected error occurred on our end. Please try again — if it keeps
          happening, contact the organising team.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-xs text-white/40">
            Ref: {error.digest}
          </p>
        )}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button onClick={() => reset()} size="lg">
            <RotateCcw className="h-5 w-5" />
            Try again
          </Button>
          <Button href="/" variant="outline" size="lg">
            <Home className="h-5 w-5" />
            Back to Home
          </Button>
        </div>
      </div>
    </section>
  );
}
