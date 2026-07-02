import { EVENT } from "@/lib/constants";
import { Reveal } from "@/components/ui/Reveal";
import { Sparkle } from "@/components/ui/Sparkle";

export function ThemeSection() {
  return (
    <section
      id="theme"
      className="relative scroll-mt-24 overflow-hidden bg-offwhite py-20 lg:py-28"
    >
      <div className="absolute inset-0 bg-stripes-light" aria-hidden />
      {/* faint corner sparkle */}
      <Sparkle className="animate-float-slow absolute right-[7%] top-16 h-16 w-16 text-navy/[0.06]" />

      <div className="container-section relative">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="eyebrow">Summit Theme</p>
          {/* gavel-strike gold rule */}
          <div className="mx-auto mt-5 h-0.5 w-12 bg-gold" aria-hidden />

          <h2 className="heading-display mt-7 text-balance text-3xl leading-[1.15] text-navy sm:text-4xl lg:text-[2.9rem]">
            <span className="block">{EVENT.themeLeadIn}</span>
            <span className="mt-2 block text-gradient-green">
              {EVENT.themeHighlight}
            </span>
          </h2>

          <p className="mx-auto mt-7 max-w-2xl text-pretty leading-relaxed text-ink/70">
            IEPS 3.0 frames the Nigerian parliament not as a distant institution
            but as a strategic partner in solving the nation&apos;s most pressing
            educational challenges. By examining the legislature&apos;s capacity
            for visionary leadership and policy reform, the summit positions
            parliamentarians at the heart of nation building — and of a stronger,
            more equitable education system.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
