import { ORGANIZERS } from "@/lib/constants";
import { Reveal } from "@/components/ui/Reveal";
import { Badge } from "@/components/ui/Badge";
import { OrgLogo } from "@/components/ui/OrgLogo";

export function OrganizersSection() {
  return (
    <section id="organizers" className="bg-offwhite py-20 lg:py-28">
      <div className="container-section">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">In Collaboration</p>
          <h2 className="heading-display mt-3 text-3xl text-navy sm:text-4xl lg:text-[2.75rem]">
            Organisers &amp; Partners
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-ink/75">
            IEPS 3.0 is convened by the Education Students&apos; Representative
            Council (ESRC), OAU, in collaboration with the Education
            Students&apos; Association of Nigeria (ESAN), and hosted at Obafemi
            Awolowo University.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {ORGANIZERS.map((org, i) => (
            <Reveal key={org.abbr} delay={i * 0.1} as="article">
              <div className="flex h-full flex-col items-center rounded-3xl border border-navy/10 bg-white p-8 text-center shadow-card transition-transform duration-200 hover:-translate-y-1">
                <span className="grid h-24 w-24 place-items-center rounded-full bg-offwhite p-3 ring-1 ring-navy/5">
                  <OrgLogo
                    src={org.logo}
                    fallback={org.fallback}
                    alt={`${org.name} logo`}
                    size={88}
                  />
                </span>
                <Badge tone="emerald" className="mt-5">
                  {org.role}
                </Badge>
                <h3 className="mt-4 font-display text-lg font-bold text-navy">
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
