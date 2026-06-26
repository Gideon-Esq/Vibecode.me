import { Quote } from "lucide-react";
import { EVENT, THEME_QUOTE } from "@/lib/constants";
import { Reveal } from "@/components/ui/Reveal";

export function ThemeSection() {
  return (
    <section
      id="theme"
      className="relative scroll-mt-24 overflow-hidden bg-navy py-20 text-white lg:py-28"
    >
      <div className="absolute inset-0 gradient-navy" aria-hidden />
      <div className="absolute inset-0 bg-dots opacity-40" aria-hidden />
      <div
        className="absolute right-0 top-0 h-72 w-72 rounded-full bg-green/20 blur-3xl"
        aria-hidden
      />
      <div
        className="absolute -left-10 bottom-0 h-72 w-72 rounded-full bg-gold/10 blur-3xl"
        aria-hidden
      />

      <div className="container-section relative">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="eyebrow text-gold">Event Theme</p>

          <h2 className="heading-display mt-4 text-balance text-3xl leading-[1.1] sm:text-4xl lg:text-5xl">
            <span className="block text-white">{EVENT.themeLeadIn}</span>
            <span className="mt-2 block text-gradient-gold">
              {EVENT.themeHighlight}
            </span>
          </h2>

          <p className="mx-auto mt-7 max-w-2xl text-pretty leading-relaxed text-white/75">
            IEPS 3.0 frames the Nigerian parliament not as a distant institution
            but as a strategic partner in solving the nation&apos;s most pressing
            educational challenges. By examining the legislature&apos;s capacity
            for visionary leadership and policy reform, the summit positions
            parliamentarians at the heart of nation building — and of a stronger,
            more equitable education system.
          </p>
        </Reveal>

        {/* Decorative gold italic pull-quote */}
        <Reveal delay={0.12} className="mx-auto mt-12 max-w-3xl">
          <figure className="relative rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur sm:p-10">
            <Quote
              className="absolute -top-5 left-8 h-12 w-12 text-gold"
              aria-hidden
            />
            <blockquote>
              <p className="font-display text-xl italic leading-relaxed text-gold sm:text-2xl">
                &ldquo;{THEME_QUOTE}&rdquo;
              </p>
            </blockquote>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
