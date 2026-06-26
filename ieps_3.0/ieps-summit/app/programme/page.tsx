import type { Metadata } from "next";
import { Clock, CalendarClock, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
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
        <div className="absolute inset-0 gradient-navy" aria-hidden />
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

      {/* Timeline */}
      <section className="bg-offwhite py-20 lg:py-28">
        <div className="container-section">
          <div className="relative mx-auto max-w-4xl">
            {/* center line (desktop) / left line (mobile) */}
            <div
              className="absolute left-5 top-0 h-full w-0.5 bg-navy/15 lg:left-1/2 lg:-translate-x-1/2"
              aria-hidden
            />

            <ol className="space-y-8 lg:space-y-0">
              {PROGRAMME_TIMELINE.map((item, i) => {
                const left = i % 2 === 0;
                return (
                  <li key={item.title} className="relative lg:min-h-[150px]">
                    {/* node */}
                    <span
                      className="absolute left-5 top-1.5 z-10 grid h-10 w-10 -translate-x-1/2 place-items-center rounded-full bg-gold font-display text-sm font-bold text-navy shadow-gold ring-4 ring-offwhite lg:left-1/2"
                      aria-hidden
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <Reveal
                      className={`ml-12 lg:ml-0 lg:w-[calc(50%-2.5rem)] ${
                        left ? "lg:mr-auto lg:pr-4 lg:text-right" : "lg:ml-auto lg:pl-4"
                      }`}
                    >
                      <article className="card-hover overflow-hidden rounded-2xl border border-navy/10 bg-white p-6 shadow-card">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full bg-green/10 px-3 py-1 font-label text-xs font-semibold uppercase tracking-wide text-green ${
                            left ? "lg:flex-row-reverse" : ""
                          }`}
                        >
                          <Clock className="h-3.5 w-3.5" />
                          {item.time}
                        </span>
                        <h3 className="mt-3 font-display text-lg font-bold text-navy">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-ink/70">
                          {item.description}
                        </p>
                      </article>
                    </Reveal>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* coming soon banner */}
          <Reveal className="mx-auto mt-16 max-w-2xl">
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-gold/40 bg-gold/10 px-6 py-4 text-center">
              <CalendarClock className="h-5 w-5 shrink-0 text-gold-600" />
              <p className="font-medium text-navy">
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
      </section>
    </>
  );
}
