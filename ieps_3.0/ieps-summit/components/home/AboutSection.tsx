import { GraduationCap, Landmark, Handshake } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ABOUT_FEATURES, STATS } from "@/lib/constants";
import { Reveal } from "@/components/ui/Reveal";
import { CountUp } from "@/components/ui/CountUp";
import { Button } from "@/components/ui/Button";

const ICONS: Record<string, LucideIcon> = {
  graduation: GraduationCap,
  landmark: Landmark,
  handshake: Handshake,
};

export function AboutSection() {
  return (
    <section id="about" className="bg-offwhite py-20 lg:py-28">
      <div className="container-section">
        {/* Heading block */}
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">About the Summit</p>
          <h2 className="heading-display mt-3 text-3xl text-navy sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
            Where Student Voices Shape{" "}
            <span className="gold-underline">Nigeria&apos;s Future</span>
          </h2>
          <p className="mx-auto mt-5 max-w-prose text-pretty leading-relaxed text-ink/75">
            The Education Students&apos; Representative Council (ESRC), OAU, in
            collaboration with the Education Students&apos; Association of Nigeria
            (ESAN), proposes a parliamentary summit that provides a platform for
            student parliamentarians from across Nigeria to engage in meaningful
            dialogue about current issues, develop critical thinking and
            communication skills, and explore solutions through a simulated
            parliamentary process.
          </p>
        </Reveal>

        {/* Feature cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {ABOUT_FEATURES.map((feature, i) => {
            const Icon = ICONS[feature.icon] ?? GraduationCap;
            return (
              <Reveal key={feature.title} delay={i * 0.1} as="article">
                <div className="group h-full rounded-2xl border-2 border-navy/10 bg-white p-7 transition-colors duration-200 hover:border-gold">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-navy text-gold transition-colors duration-200 group-hover:bg-gold group-hover:text-navy">
                    <Icon className="h-7 w-7" />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-bold text-navy">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/70">
                    {feature.text}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Animated count-up stats */}
        <Reveal delay={0.1} className="mt-14">
          <div className="grid grid-cols-1 gap-6 rounded-3xl gradient-navy p-8 text-center text-white shadow-card sm:grid-cols-3 sm:p-10">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-4xl font-bold text-gold sm:text-5xl">
                  <CountUp to={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-1 text-sm text-white/75">{stat.label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="mt-10 text-center">
          <Button href="/about" variant="secondary">
            Read the full story
          </Button>
        </div>
      </div>
    </section>
  );
}
