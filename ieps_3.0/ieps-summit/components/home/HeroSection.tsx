import { CalendarDays, MapPin, Clock, Ticket, Handshake } from "lucide-react";
import { EVENT } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { Sparkle } from "@/components/ui/Sparkle";

/** Quiet architectural decoration for the navy chamber hero — hairline
 *  column lines and a faint gold glow rising from the base. */
function ChamberAmbient() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* vertical hairlines — portico columns */}
      <div className="absolute inset-0 hidden justify-between px-[8%] md:flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="h-full w-px bg-white/[0.05]" />
        ))}
      </div>
      {/* dotted texture */}
      <div className="absolute inset-0 bg-dots opacity-30" />
      {/* floating brand sparkles — quiet gold flecks catching the dais light */}
      <Sparkle className="animate-float-slow absolute left-[8%] top-[22%] h-8 w-8 text-gold/25 sm:h-10 sm:w-10" />
      <Sparkle className="animate-float absolute right-[10%] top-[30%] h-5 w-5 text-gold/20 [animation-delay:1.2s] sm:h-7 sm:w-7" />
      <Sparkle className="animate-float-slow absolute bottom-[16%] right-[16%] h-4 w-4 text-white/15 [animation-delay:2s] sm:h-6 sm:w-6" />
      {/* top sheen */}
      <div className="absolute inset-x-0 top-0 h-64 hero-sheen" />
    </div>
  );
}

/** Date / time / venue rendered as a ruled "order paper" strip. */
function DocketStrip() {
  const items = [
    { icon: CalendarDays, label: "Date", value: EVENT.dateLabel },
    { icon: Clock, label: "Time", value: `${EVENT.timeLabel} (WAT)` },
    {
      icon: MapPin,
      label: "Venue",
      value: `${EVENT.venue.name}, OAU, ${EVENT.venue.city}`,
    },
  ];
  return (
    <dl className="mx-auto grid max-w-3xl grid-cols-1 divide-y divide-white/10 border-y border-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-start gap-3 px-5 py-4 text-left sm:py-5"
        >
          <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
          <div>
            <dt className="font-label text-[10px] font-semibold uppercase tracking-[0.28em] text-white/50">
              {item.label}
            </dt>
            <dd className="mt-1 text-sm font-medium leading-snug text-white/90">
              {item.value}
            </dd>
          </div>
        </div>
      ))}
    </dl>
  );
}

export function HeroSection() {
  return (
    <section className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-hero-aurora text-white">
      <ChamberAmbient />

      <div className="container-section relative pb-14 pt-28 lg:pb-16 lg:pt-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Summit name as small-caps kicker */}
          <p className="animate-fade-in-up font-label text-xs font-semibold uppercase tracking-[0.32em] text-gold sm:text-sm">
            {EVENT.fullName}
            <span className="mx-3 text-white/30" aria-hidden>
              ·
            </span>
            Third Edition
          </p>

          {/* gavel-strike gold rule */}
          <div
            className="mx-auto mt-6 h-0.5 w-16 animate-fade-in-up bg-gold [animation-delay:60ms]"
            aria-hidden
          />

          {/* The theme IS the headline — serif, high contrast */}
          <h1 className="heading-display mt-7 animate-fade-in-up text-balance text-4xl leading-[1.12] [animation-delay:120ms] sm:text-5xl lg:text-[3.6rem]">
            <span className="block text-white/90">{EVENT.themeLeadIn}</span>
            <span className="mt-3 block text-gradient-gold">
              {EVENT.themeHighlight}
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-xl animate-fade-in-up text-pretty text-base leading-relaxed text-white/65 [animation-delay:200ms] sm:text-lg">
            {EVENT.tagline}
          </p>

          {/* CTAs — gold register, outlined sponsor */}
          <div className="mt-10 flex animate-fade-in-up flex-col items-center justify-center gap-3 [animation-delay:280ms] sm:flex-row">
            <Button href="/register" size="lg" aria-label="Register for IEPS 3.0">
              <Ticket className="h-5 w-5" />
              Register to Attend
            </Button>
            <Button
              href="/contact"
              variant="outline"
              size="lg"
              aria-label="Partner with IEPS 3.0 as a sponsor"
            >
              <Handshake className="h-5 w-5" />
              Partner as a Sponsor
            </Button>
          </div>

          {/* Date / time / venue docket */}
          <div className="mt-12 animate-fade-in-up [animation-delay:360ms]">
            <DocketStrip />
          </div>
        </div>

        {/* Countdown at the bottom of the hero */}
        <div className="mt-12 flex animate-fade-in-up flex-col items-center [animation-delay:440ms]">
          <p className="mb-4 font-label text-xs font-semibold uppercase tracking-[0.28em] text-white/45">
            The house convenes in
          </p>
          <CountdownTimer targetISO={EVENT.dateISO} tone="dark" />
        </div>
      </div>

      {/* base gold hairline — dais edge */}
      <div className="absolute inset-x-0 bottom-0 h-px gradient-gold opacity-70" aria-hidden />
    </section>
  );
}
