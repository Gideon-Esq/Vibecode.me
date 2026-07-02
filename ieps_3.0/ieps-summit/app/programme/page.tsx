import type { Metadata } from "next";
import { Clock, CalendarClock, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Sparkle } from "@/components/ui/Sparkle";
import { EVENT, PROGRAMME_TIMELINE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Programme",
  description:
    "The IEPS 3.0 programme — seven sessions across one powerful day, from keynote addresses to the summit communiqué.",
};

export default function ProgrammePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy pb-20 pt-28 text-white lg:pb-24 lg:pt-36">
        <div className="absolute inset-0 bg-hero-aurora" aria-hidden />
        <div className="absolute inset-0 bg-dots opacity-40" aria-hidden />
        <div className="container-section relative text-center">
          <Badge tone="light" className="mb-5">
            {EVENT.dateLabel}
          </Badge>
          <h1 className="heading-display text-balance text-4xl sm:text-5xl lg:text-6xl">
            The <span className="gold-underline text-gold">Programme</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-white/75">
            Seven sessions. One powerful day. Here&apos;s how IEPS 3.0 unfolds at
            the {EVENT.venue.name}, OAU.
          </p>
        </div>
      </section>

      {/* Order of Business — a ruled parliamentary agenda (order paper) */}
      <section className="relative overflow-hidden bg-offwhite py-20 lg:py-28">
        <div className="absolute inset-0 bg-stripes-light" aria-hidden />
        <div className="container-section relative">
          <div className="mx-auto max-w-4xl">
            {/* Docket heading */}
            <Reveal className="text-center">
              <p className="eyebrow inline-flex items-center gap-2">
                <Sparkle className="h-3 w-3 text-gold-600" />
                Order Paper
              </p>
              <h2 className="heading-display mt-4 text-3xl text-navy sm:text-4xl">
                Order of Business
              </h2>
              <div className="mt-5 flex items-center justify-center gap-3" aria-hidden>
                <span className="h-0.5 w-10 bg-gold" />
                <Sparkle className="h-4 w-4 text-gold-600" />
                <span className="h-0.5 w-10 bg-gold" />
              </div>
            </Reveal>

            {/* Session docket — one ruled sheet, numbered rows */}
            <Reveal delay={0.1} className="mt-12">
              <ol className="divide-y divide-navy/10 border border-navy/10 bg-white shadow-card">
                {PROGRAMME_TIMELINE.map((item, i) => (
                  <li key={item.title}>
                    <article className="group relative grid grid-cols-[auto_1fr] gap-x-5 p-6 transition-colors duration-200 hover:bg-offwhite sm:grid-cols-[auto_1fr_auto] sm:gap-x-8 sm:p-8">
                      {/* gold left rule revealed on hover */}
                      <span
                        className="absolute inset-y-0 left-0 w-1 origin-top scale-y-0 bg-gold transition-transform duration-200 group-hover:scale-y-100"
                        aria-hidden
                      />

                      {/* serif item numeral */}
                      <span
                        className="heading-display mt-0.5 text-4xl leading-none text-gold-600/50 transition-colors duration-200 group-hover:text-gold-600 sm:text-5xl"
                        aria-hidden
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>

                      <div>
                        {/* time slot as small-caps kicker (mobile: above title) */}
                        <p className="font-label text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-600 sm:hidden">
                          {item.time}
                        </p>
                        <h3 className="heading-display mt-1 text-lg leading-snug text-navy sm:mt-0 sm:text-xl">
                          {item.title}
                        </h3>
                        <p className="mt-2 max-w-prose text-sm leading-relaxed text-ink/70">
                          {item.description}
                        </p>
                      </div>

                      {/* time slot, right-aligned on desktop */}
                      <span className="hidden items-center gap-1.5 self-start font-label text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-600 sm:inline-flex">
                        <Clock className="h-3.5 w-3.5" />
                        {item.time}
                      </span>
                    </article>
                  </li>
                ))}
              </ol>
            </Reveal>

            {/* coming soon note — ruled, order-paper style */}
            <Reveal className="mt-10">
              <div className="flex items-center justify-center gap-3 border border-gold/40 bg-gold/10 px-6 py-4 text-center">
                <CalendarClock className="h-5 w-5 shrink-0 text-gold-600" />
                <p className="text-sm font-medium text-navy sm:text-base">
                  Detailed schedule with exact times coming soon.
                </p>
              </div>
            </Reveal>

            {/* CTA */}
            <Reveal className="mt-10 text-center">
              <Button href="/register" size="lg">
                Secure Your Spot — Register Now
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
