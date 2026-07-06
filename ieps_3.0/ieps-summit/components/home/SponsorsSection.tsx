import Image from "next/image";
import { Handshake, ArrowRight } from "lucide-react";
import { SPONSORS } from "@/lib/constants";
import { Reveal } from "@/components/ui/Reveal";
import { Sparkle } from "@/components/ui/Sparkle";

export function SponsorsSection() {
  return (
    <section
      id="sponsors"
      className="relative overflow-hidden bg-mesh-light py-20 lg:py-28"
    >
      {/* top gold hairline + faint portico stripes + ambient sparkles */}
      <div className="absolute inset-x-0 top-0 h-px gradient-gold opacity-60" aria-hidden />
      <div className="absolute inset-0 bg-stripes-light opacity-60" aria-hidden />
      <Sparkle className="animate-float-slow absolute left-[7%] top-[22%] h-8 w-8 text-gold/20" />
      <Sparkle className="animate-float absolute right-[9%] bottom-[20%] h-6 w-6 text-gold/15 [animation-delay:1.4s]" />

      <div className="container-section relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow inline-flex items-center gap-2 justify-center">
            <Sparkle className="h-3 w-3 text-gold" />
            Proudly Supported By
          </p>
          <h2 className="heading-display mt-4 text-3xl text-navy sm:text-4xl lg:text-[2.75rem]">
            Our <span className="text-gradient-green">Sponsors</span>
          </h2>
          <div className="mx-auto mt-5 h-0.5 w-12 bg-gold" aria-hidden />
          <p className="mt-6 text-pretty leading-relaxed text-ink/70">
            IEPS 3.0 is made possible by partners who believe in student-led
            leadership and educational reform. We&apos;re proud to stand with
            them.
          </p>
        </Reveal>

        <div className="mx-auto mt-14 grid max-w-3xl gap-6 sm:grid-cols-2">
          {SPONSORS.map((sponsor, i) => (
            <Reveal key={sponsor.name} delay={i * 0.1} as="article">
              <div className="group relative flex h-40 items-center justify-center overflow-hidden rounded-2xl border border-navy/10 bg-white px-10 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-lg">
                {/* gold top accent that sweeps in on hover */}
                <span
                  className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 gradient-gold transition-transform duration-300 group-hover:scale-x-100"
                  aria-hidden
                />
                {/* corner sparkle flourish */}
                <Sparkle className="absolute right-4 top-4 h-4 w-4 text-gold/0 transition-colors duration-300 group-hover:text-gold/40" />
                <Image
                  src={sponsor.logo}
                  alt={`${sponsor.name} logo`}
                  width={260}
                  height={78}
                  unoptimized
                  className="max-h-20 w-auto max-w-[82%] object-contain"
                />
              </div>
            </Reveal>
          ))}

          {/* Become-a-sponsor invitation — keeps the row balanced with a single
              sponsor and scales gracefully as more logos are added. */}
          <Reveal delay={SPONSORS.length * 0.1} as="article">
            <a
              href="/contact"
              aria-label="Partner with IEPS 3.0 as a sponsor"
              className="group relative flex h-40 flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-navy/20 bg-white/40 px-8 text-center transition-all duration-300 hover:border-gold hover:bg-gold/5"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full bg-navy/5 text-navy transition-colors duration-300 group-hover:bg-gold/20 group-hover:text-gold-600">
                <Handshake className="h-6 w-6" />
              </span>
              <span className="font-display text-base font-bold text-navy">
                Become a Sponsor
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-ink/55 transition-colors group-hover:text-gold-600">
                Partner with IEPS 3.0
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
