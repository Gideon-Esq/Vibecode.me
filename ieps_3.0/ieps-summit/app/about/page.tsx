import type { Metadata } from "next";
import {
  MessagesSquare,
  Briefcase,
  Compass,
  Vote,
  UsersRound,
  Megaphone,
  Hand,
  Quote,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { OrgLogo } from "@/components/ui/OrgLogo";
import {
  EVENT,
  ORGANIZERS,
  OBJECTIVES,
  TEAM,
  THEME_QUOTE,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description:
    "About the Ife Education Parliamentary Summit 3.0 — its mission, theme, objectives and the bodies behind it.",
};

const OBJECTIVE_ICONS: Record<string, LucideIcon> = {
  messages: MessagesSquare,
  briefcase: Briefcase,
  compass: Compass,
  vote: Vote,
  "users-round": UsersRound,
  megaphone: Megaphone,
  hand: Hand,
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy pb-20 pt-28 text-white lg:pb-24 lg:pt-36">
        <div className="absolute inset-0 gradient-navy" aria-hidden />
        <div className="absolute inset-0 bg-dots opacity-40" aria-hidden />
        <div className="container-section relative text-center">
          <Badge tone="light" className="mb-5">
            3rd Edition · {EVENT.venue.city}
          </Badge>
          <h1 className="heading-display text-balance text-4xl sm:text-5xl lg:text-6xl">
            About IEPS <span className="gold-underline text-gold">3.0</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-white/75">
            A student-led movement bringing the energy of the lecture hall into
            dialogue with the machinery of national lawmaking.
          </p>
        </div>
      </section>

      {/* What is IEPS */}
      <section className="bg-offwhite py-20 lg:py-28">
        <div className="container-section grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="eyebrow">What is IEPS?</p>
            <h2 className="heading-display mt-3 text-3xl text-navy sm:text-4xl">
              Where student voices meet national policy
            </h2>
            <div className="mt-5 space-y-4 text-pretty leading-relaxed text-ink/75">
              <p>
                The Ife Education Parliamentary Summit (IEPS) is the flagship
                advocacy event of the Education Students&apos; Representative
                Council (ESRC), Obafemi Awolowo University, in collaboration with
                the Education Students&apos; Association of Nigeria (ESAN).
              </p>
              <p>
                Now in its <strong>third edition</strong>, IEPS has grown into a
                national platform where student parliamentarians from across
                Nigeria gather to debate pressing issues, sharpen their critical
                thinking and communication, and explore solutions through a
                simulated parliamentary process.
              </p>
              <p>
                Our mission is simple but ambitious: to position students not as
                bystanders but as active contributors to the policies that shape
                Nigerian education and national development.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-3xl bg-navy p-8 text-white shadow-card sm:p-10">
              <h3 className="font-display text-lg font-bold text-gold">
                Our Mission
              </h3>
              <p className="mt-3 leading-relaxed text-white/80">
                To empower the next generation of education leaders to engage
                parliamentarians, shape reform, and build a more educated, united
                and prosperous Nigeria.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-6 text-center">
                <div>
                  <p className="font-display text-3xl font-bold text-gold">3rd</p>
                  <p className="mt-1 text-xs text-white/60">Edition</p>
                </div>
                <div>
                  <p className="font-display text-3xl font-bold text-gold">7</p>
                  <p className="mt-1 text-xs text-white/60">Sessions</p>
                </div>
                <div>
                  <p className="font-display text-3xl font-bold text-gold">1</p>
                  <p className="mt-1 text-xs text-white/60">Day</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* The Theme */}
      <section className="relative overflow-hidden bg-navy py-20 text-white lg:py-28">
        <div className="absolute inset-0 gradient-navy" aria-hidden />
        <div className="absolute inset-0 bg-dots opacity-40" aria-hidden />
        <div className="container-section relative mx-auto max-w-4xl text-center">
          <Reveal>
            <p className="eyebrow text-gold">The Theme</p>
            <h2 className="heading-display mt-4 text-balance text-2xl leading-snug sm:text-3xl lg:text-4xl">
              <span className="block text-white">{EVENT.themeLeadIn}</span>
              <span className="mt-2 block text-gradient-gold">
                {EVENT.themeHighlight}
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-pretty leading-relaxed text-white/75">
              The summit reframes the Nigerian parliament as a strategic partner
              in solving the nation&apos;s most pressing educational challenges.
              By examining the legislature&apos;s capacity for visionary
              leadership and reform-minded policy, IEPS 3.0 places
              parliamentarians at the heart of both nation building and a
              stronger, more equitable education system.
            </p>
          </Reveal>
          <Reveal delay={0.12} className="mx-auto mt-10 max-w-3xl">
            <figure className="relative rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
              <Quote className="absolute -top-5 left-8 h-12 w-12 text-gold" aria-hidden />
              <blockquote>
                <p className="font-display text-xl italic leading-relaxed text-gold sm:text-2xl">
                  &ldquo;{THEME_QUOTE}&rdquo;
                </p>
              </blockquote>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* Objectives */}
      <section className="bg-offwhite py-20 lg:py-28">
        <div className="container-section">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Our Objectives</p>
            <h2 className="heading-display mt-3 text-3xl text-navy sm:text-4xl">
              Seven goals driving the summit
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {OBJECTIVES.map((obj, i) => {
              const Icon = OBJECTIVE_ICONS[obj.icon] ?? MessagesSquare;
              return (
                <Reveal key={obj.title} delay={(i % 3) * 0.08} as="article">
                  <div className="card-hover group h-full overflow-hidden rounded-2xl border border-navy/10 bg-white p-6 shadow-card">
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-green/10 text-green transition-colors duration-200 group-hover:bg-green group-hover:text-white">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="font-display text-3xl font-bold text-navy/10">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="mt-4 font-display text-lg font-bold text-navy">
                      {obj.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink/70">
                      {obj.text}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Organizing bodies */}
      <section className="bg-white py-20 lg:py-28">
        <div className="container-section">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Organising Bodies</p>
            <h2 className="heading-display mt-3 text-3xl text-navy sm:text-4xl">
              The bodies behind IEPS 3.0
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {ORGANIZERS.map((org, i) => (
              <Reveal key={org.abbr} delay={i * 0.1} as="article">
                <div className="flex h-full flex-col items-center rounded-3xl border border-navy/10 bg-offwhite p-8 text-center shadow-card">
                  <span className="grid h-24 w-24 place-items-center rounded-full bg-white p-3 ring-1 ring-navy/5">
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
                  <p className="mt-2 text-xs leading-relaxed text-ink/55">
                    {org.detail}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* The Team */}
      <section className="bg-offwhite py-20 lg:py-28">
        <div className="container-section">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">The Team</p>
            <h2 className="heading-display mt-3 text-3xl text-navy sm:text-4xl">
              The people making it happen
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-ink/70">
              The full organising committee will be announced soon.
            </p>
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3">
            {TEAM.map((member, i) => {
              const announced = member.name !== "To be announced";
              return (
                <Reveal key={member.role} delay={(i % 3) * 0.08}>
                  <div className="flex h-full flex-col items-center rounded-2xl border border-navy/10 bg-white p-6 text-center shadow-card">
                    <span className="grid h-20 w-20 place-items-center rounded-full bg-navy text-gold">
                      <User className="h-9 w-9" />
                    </span>
                    <h3
                      className={`mt-4 font-display text-base font-bold ${
                        announced ? "text-navy" : "text-ink/40"
                      }`}
                    >
                      {member.name}
                    </h3>
                    <p className="mt-1 font-label text-xs font-semibold uppercase tracking-wide text-green">
                      {member.role}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white pb-20 lg:pb-28">
        <div className="container-section">
          <div className="rounded-3xl gradient-gold px-6 py-12 text-center sm:px-12">
            <h2 className="heading-display text-2xl text-navy sm:text-3xl">
              Be part of the third edition
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-navy/80">
              Registration is free. Join student parliamentarians from across
              Nigeria on {EVENT.dateLabel}.
            </p>
            <Button
              href="/register"
              variant="secondary"
              size="lg"
              className="mt-6 bg-navy text-white hover:bg-navy-light"
            >
              Register Now
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
