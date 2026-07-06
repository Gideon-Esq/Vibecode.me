import Image from "next/image";
import { SPONSORS } from "@/lib/constants";
import { Reveal } from "@/components/ui/Reveal";

export function SponsorsSection() {
  return (
    <section id="sponsors" className="bg-white py-16 lg:py-20">
      <div className="container-section">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Proudly Supported By</p>
          <h2 className="heading-display mt-4 text-2xl text-navy sm:text-3xl">
            Our Sponsors
          </h2>
          <div className="mx-auto mt-5 h-0.5 w-12 bg-gold" aria-hidden />
        </Reveal>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
          {SPONSORS.map((sponsor, i) => (
            <Reveal
              key={sponsor.name}
              delay={i * 0.1}
              className="flex h-28 w-64 items-center justify-center border border-navy/10 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-card"
            >
              <Image
                src={sponsor.logo}
                alt={`${sponsor.name} logo`}
                width={220}
                height={66}
                unoptimized
                className="h-auto max-h-full w-auto max-w-full object-contain"
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
