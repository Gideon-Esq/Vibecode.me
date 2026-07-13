import { ArrowUpRight } from "lucide-react";
import { PROGRAMME } from "@/lib/constants";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Sparkle } from "@/components/ui/Sparkle";

export function ProgrammeHighlights() {
  return (
    <section
      id="programme"
      className="relative overflow-hidden bg-offwhite py-20 lg:py-28"
    >
      <div className="absolute inset-0 bg-stripes-light" aria-hidden />
      <div className="container-section relative">
        <Reveal className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="eyebrow inline-flex items-center gap-2">
              <Sparkle className="h-3 w-3 text-gold-600" />
              Order of Business
            </p>
            <h2 className="heading-display mt-4 text-3xl text-navy sm:text-4xl lg:text-[2.75rem]">
              Seven Sessions. One Sitting Day.
            </h2>
            <p className="mt-5 max-w-prose text-pretty leading-relaxed text-ink/75">
              Keynotes, a live parliamentary simulation, hands-on workshops and
              recognition, all in one sitting day. This isn&apos;t another
              conference; it&apos;s where ideas become policy.
            </p>
          </div>
          <Button href="/programme" variant="ghost" className="shrink-0">
            Full programme
            <ArrowUpRight className="h-5 w-5" />
          </Button>
        </Reveal>

        {/* Numbered agenda items — ruled list, roman numerals in serif */}
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {PROGRAMME.map((item, i) => (
            <Reveal key={item.title} delay={(i % 2) * 0.08} as="article" className="h-full">
              <div className="group relative flex h-full items-start gap-6 overflow-hidden border border-navy/10 bg-white p-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-card">
                {/* gold left rule revealed on hover */}
                <span
                  className="absolute inset-y-0 left-0 w-1 origin-top scale-y-0 bg-gold transition-transform duration-200 group-hover:scale-y-100"
                  aria-hidden
                />
                {/* serif item number */}
                <span
                  className="heading-display mt-0.5 shrink-0 text-3xl leading-none text-gold-600/60 transition-colors duration-200 group-hover:text-gold-600"
                  aria-hidden
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="heading-display text-lg leading-snug text-navy">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/70">
                    {item.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
