import { GraduationCap, Landmark, Handshake } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ABOUT_FEATURES, STATS } from "@/lib/constants";
import { Reveal } from "@/components/ui/Reveal";
import { CountUp } from "@/components/ui/CountUp";
import { Button } from "@/components/ui/Button";
import { Sparkle } from "@/components/ui/Sparkle";

const ICONS: Record<string, LucideIcon> = {
  graduation: GraduationCap,
  landmark: Landmark,
  handshake: Handshake,
};

export function AboutSection() {
  return (
    <section id="about" className="relative overflow-hidden bg-white py-20 lg:py-28">
      <div className="absolute inset-0 bg-stripes-light opacity-60" aria-hidden />
      {/* faint corner sparkle */}
      <Sparkle className="animate-float absolute left-[6%] top-24 h-14 w-14 text-navy/[0.05]" />
      <div className="container-section relative">
        {/* Heading block */}
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="eyebrow inline-flex items-center gap-2">
            <Sparkle className="h-3 w-3 text-gold-600" />
            About the Summit
          </p>
          <h2 className="heading-display mt-4 text-3xl text-navy sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]">
            Where Student Voices Shape{" "}
            <span className="gold-underline">Nigeria&apos;s Future</span>
          </h2>
          <p className="mx-auto mt-6 max-w-prose text-pretty leading-relaxed text-ink/75">
            The Education Students&apos; Representative Council (ESRC), OAU, in
            collaboration with the Education Students&apos; Association of Nigeria
            (ESAN), proposes a parliamentary summit that provides a platform for
            student parliamentarians from across Nigeria to engage in meaningful
            dialogue about current issues, develop critical thinking and
            communication skills, and explore solutions through a simulated
            parliamentary process.
          </p>
        </Reveal>

        {/* Feature cards — ruled, squared, order-paper style */}
        <div className="mt-14 grid gap-px overflow-hidden border border-navy/10 bg-navy/10 md:grid-cols-3">
          {ABOUT_FEATURES.map((feature, i) => {
            const Icon = ICONS[feature.icon] ?? GraduationCap;
            return (
              <Reveal key={feature.title} delay={i * 0.1} as="article" className="h-full">
                <div className="group relative h-full bg-white p-8 transition-colors duration-200 hover:bg-offwhite">
                  <span
                    className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100"
                    aria-hidden
                  />
                  <span className="grid h-12 w-12 place-items-center border border-navy/15 text-navy transition-colors duration-200 group-hover:border-gold group-hover:text-gold-600">
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                  </span>
                  <h3 className="heading-display mt-6 text-xl text-navy">
                    {feature.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink/70">
                    {feature.text}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Animated count-up stats — navy band with gold figures */}
        <Reveal delay={0.1} className="mt-14">
          <div className="grid grid-cols-1 gap-8 gradient-navy p-10 text-center text-white sm:grid-cols-3 sm:gap-6 sm:p-12">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="heading-display text-4xl text-gold sm:text-5xl">
                  <CountUp to={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-2 font-label text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="mt-12 text-center">
          <Button href="/about" variant="secondary">
            Read the full story
          </Button>
        </div>
      </div>
    </section>
  );
}
