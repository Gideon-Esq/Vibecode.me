import type { ReactNode } from "react";
import { Construction } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EVENT } from "@/lib/constants";

/**
 * Shared scaffold for pages that are fully built in later prompts.
 * Renders a branded hero + a "coming soon" panel so navigation never
 * lands on a blank screen.
 */
export function PagePlaceholder({
  eyebrow,
  title,
  description,
  comingIn,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  comingIn?: string;
  children?: ReactNode;
}) {
  return (
    <>
      {/* Hero band */}
      <section className="relative overflow-hidden bg-navy pb-16 pt-28 text-white lg:pb-20 lg:pt-36">
        <div className="absolute inset-0 bg-hero-aurora" aria-hidden />
        <div className="absolute inset-0 bg-dots opacity-40" aria-hidden />
        <div className="container-section relative">
          <Badge tone="light" className="mb-5">
            {eyebrow}
          </Badge>
          <h1 className="heading-display text-balance text-4xl sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-white/75">
            {description}
          </p>
        </div>
      </section>

      {/* Body */}
      <section className="bg-offwhite py-16 lg:py-24">
        <div className="container-section">
          {children ?? (
            <div className="mx-auto max-w-xl rounded-3xl border border-navy/10 bg-white p-10 text-center shadow-card">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-green/10 text-green-600">
                <Construction className="h-8 w-8" />
              </span>
              <h2 className="mt-6 font-display text-2xl font-bold text-navy">
                This page is on the way
              </h2>
              <p className="mt-3 text-ink/70">
                We&apos;re putting the finishing touches on this section
                {comingIn ? ` (${comingIn})` : ""}. In the meantime, secure your
                place at {EVENT.shortName}.
              </p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Button href="/register">Register Now</Button>
                <Button href="/" variant="ghost">
                  Back to home
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
