import { CalendarDays, MapPin, ArrowRight, Ticket } from "lucide-react";
import { EVENT } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { CountdownTimer } from "@/components/ui/CountdownTimer";

/** Decorative floating geometric shapes (education / parliament motif). */
function FloatingShapes() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* gold ring */}
      <div className="absolute left-[8%] top-[22%] h-24 w-24 animate-float rounded-full border-2 border-gold/30" />
      {/* green diamond */}
      <div className="absolute right-[12%] top-[18%] h-16 w-16 animate-float-slow rotate-45 rounded-lg border-2 border-green/40" />
      {/* gold dot */}
      <div className="absolute right-[24%] top-[60%] h-3 w-3 animate-float rounded-full bg-gold/60" />
      {/* mortarboard-ish square */}
      <div className="absolute left-[18%] bottom-[18%] h-10 w-10 animate-float-slow rotate-12 rounded bg-white/5" />
      {/* large soft blobs */}
      <div className="absolute -left-32 top-24 h-72 w-72 rounded-full bg-green/20 blur-3xl" />
      <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-gold/15 blur-3xl" />
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-navy text-white">
      {/* layered backdrops: radial glow + diagonal lines + grid dots */}
      <div className="absolute inset-0 gradient-navy" aria-hidden />
      <div className="absolute inset-0 bg-navy-radial" aria-hidden />
      <div className="absolute inset-0 bg-diagonal" aria-hidden />
      <div className="absolute inset-0 bg-dots opacity-40" aria-hidden />
      <FloatingShapes />

      <div className="container-section relative pb-12 pt-28 lg:pb-16 lg:pt-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* 3.0 gold pill badge above title */}
          <div className="flex justify-center">
            <span className="inline-flex animate-fade-in-up items-center gap-2 rounded-full bg-gold px-5 py-1.5 font-display text-lg font-bold text-navy shadow-gold">
              3.0
              <span className="font-label text-xs font-semibold uppercase tracking-[0.18em] text-navy/70">
                3rd Edition
              </span>
            </span>
          </div>

          {/* Big display title */}
          <h1 className="heading-display mt-6 animate-fade-in-up text-balance text-3xl leading-[1.05] [animation-delay:80ms] sm:text-5xl lg:text-6xl xl:text-[4.5rem]">
            IFE EDUCATION{" "}
            <span className="text-gradient-gold">PARLIAMENTARY</span> SUMMIT
          </h1>

          {/* Theme as subheading */}
          <p className="mx-auto mt-6 max-w-2xl animate-fade-in-up text-pretty text-base leading-relaxed text-white/80 [animation-delay:160ms] sm:text-lg">
            {EVENT.theme}
          </p>

          {/* CTAs */}
          <div className="mt-9 flex animate-fade-in-up flex-col items-center justify-center gap-3 [animation-delay:240ms] sm:flex-row">
            <Button href="/register" size="lg" aria-label="Register for IEPS 3.0">
              <Ticket className="h-5 w-5" />
              Register Now
            </Button>
            <Button href="/about" variant="outline" size="lg">
              Learn More
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Event details strip — gold */}
          <div className="mt-8 flex animate-fade-in-up flex-col items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-gold [animation-delay:320ms] sm:flex-row">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              {EVENT.dateLabel}
            </span>
            <span className="hidden text-gold/40 sm:inline" aria-hidden>
              |
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {EVENT.venue.shortName}, {EVENT.venue.city}
            </span>
          </div>
        </div>

        {/* Countdown at the bottom of the hero */}
        <div className="mt-12 flex animate-fade-in-up flex-col items-center [animation-delay:400ms]">
          <p className="mb-4 font-label text-sm font-semibold uppercase tracking-[0.22em] text-white/60">
            Summit begins in
          </p>
          <CountdownTimer targetISO={EVENT.dateISO} tone="dark" />
        </div>
      </div>

      {/* bottom wave divider into off-white */}
      <div className="relative">
        <svg
          className="block h-[50px] w-full text-offwhite sm:h-[80px]"
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            fill="currentColor"
            d="M0 90h1440V40c-180 36-420 50-720 28C420 47 200 38 0 60Z"
          />
        </svg>
      </div>
    </section>
  );
}
