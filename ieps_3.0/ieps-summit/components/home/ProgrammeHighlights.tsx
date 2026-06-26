import { ArrowUpRight } from "lucide-react";
import { PROGRAMME } from "@/lib/constants";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

export function ProgrammeHighlights() {
  return (
    <section id="programme" className="bg-offwhite py-20 lg:py-28">
      <div className="container-section">
        <Reveal className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="eyebrow">Programme Highlights</p>
            <h2 className="heading-display mt-3 text-3xl text-navy sm:text-4xl lg:text-[2.75rem]">
              7 Sessions. One Powerful Day.
            </h2>
            <p className="mt-4 max-w-prose text-pretty leading-relaxed text-ink/75">
              A full day of keynote insight, live parliamentary simulation,
              hands-on workshops and recognition — designed to inform, challenge
              and inspire.
            </p>
          </div>
          <Button href="/programme" variant="ghost" className="shrink-0">
            Full programme
            <ArrowUpRight className="h-5 w-5" />
          </Button>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {PROGRAMME.map((item, i) => (
            <Reveal key={item.title} delay={(i % 2) * 0.08} as="article">
              <div className="group relative flex h-full items-start gap-5 overflow-hidden rounded-2xl border border-navy/10 bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                {/* gold left border revealed on hover */}
                <span
                  className="absolute inset-y-0 left-0 w-1.5 origin-top scale-y-0 bg-gold transition-transform duration-200 group-hover:scale-y-100"
                  aria-hidden
                />
                {/* number badge */}
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gold/15 font-display text-xl font-bold text-gold-600 transition-colors duration-200 group-hover:bg-gold group-hover:text-navy">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-navy">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink/70">
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
