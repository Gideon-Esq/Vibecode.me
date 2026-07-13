import { ORGANIZERS } from "@/lib/constants";
import { Reveal } from "@/components/ui/Reveal";
import { Badge } from "@/components/ui/Badge";
import { OrgLogo } from "@/components/ui/OrgLogo";

export function OrganizersSection() {
  return (
    <section
      id="organizers"
      className="relative overflow-hidden bg-offwhite py-20 lg:py-28"
    >
      <div className="absolute inset-0 bg-stripes-light opacity-70" aria-hidden />
      <div className="container-section relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Organiser</p>
          <h2 className="heading-display mt-4 text-3xl text-navy sm:text-4xl lg:text-[2.75rem]">
            Organisers &amp; Partners
          </h2>
          <div className="mx-auto mt-5 h-0.5 w-12 bg-gold" aria-hidden />
          <p className="mt-6 text-pretty leading-relaxed text-ink/75">
            IEPS 3.0 is organised by the Education Students&apos; Representative
            Council (ESRC), OAU, and hosted at Obafemi Awolowo University.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {ORGANIZERS.map((org, i) => (
            <Reveal key={org.abbr} delay={i * 0.1} as="article" className="h-full">
              <div className="flex h-full flex-col items-center border border-navy/10 bg-white p-8 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-card">
                <span className="grid h-24 w-24 place-items-center rounded-full bg-offwhite p-3 ring-1 ring-navy/10">
                  <OrgLogo
                    src={org.logo}
                    fallback={org.fallback}
                    alt={`${org.name} logo`}
                    size={88}
                  />
                </span>
                <Badge tone="gold" className="mt-6">
                  {org.role}
                </Badge>
                <h3 className="heading-display mt-4 text-lg text-navy">
                  {org.abbr}
                </h3>
                <p className="mt-1 text-sm font-medium text-ink/80">
                  {org.name}
                </p>
                <p className="mt-1 text-xs text-ink/55">{org.detail}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
