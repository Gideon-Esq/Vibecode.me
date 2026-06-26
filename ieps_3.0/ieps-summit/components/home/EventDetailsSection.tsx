import { CalendarDays, Clock, MapPin, Users2, ArrowRight } from "lucide-react";
import { EVENT, ORGANIZERS } from "@/lib/constants";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

const DETAILS = [
  {
    icon: CalendarDays,
    label: "Date",
    value: EVENT.dateLabel,
  },
  {
    icon: Clock,
    label: "Time",
    value: `${EVENT.timeLabel} (WAT)`,
  },
  {
    icon: MapPin,
    label: "Venue",
    value: `${EVENT.venue.name}, ${EVENT.venue.institution}, ${EVENT.venue.city}, ${EVENT.venue.state}`,
  },
  {
    icon: Users2,
    label: "Organised by",
    value: "ESRC, OAU & ESAN",
  },
];

/** Abstract CSS/SVG geometric art in navy/gold/green — campus/parliament motif. */
function GeometricArt() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md" aria-hidden>
      {/* concentric rings */}
      <div className="absolute inset-0 rounded-full border border-white/10" />
      <div className="absolute inset-[12%] rounded-full border border-white/10" />
      <div className="absolute inset-[24%] rounded-full border border-gold/20" />

      {/* stylised dome / building */}
      <svg viewBox="0 0 320 320" className="absolute inset-0 h-full w-full">
        {/* dome */}
        <path
          d="M110 150 a50 50 0 0 1 100 0 Z"
          fill="none"
          stroke="#F5C400"
          strokeWidth="3"
        />
        <line x1="160" y1="92" x2="160" y2="100" stroke="#F5C400" strokeWidth="3" />
        <circle cx="160" cy="86" r="6" fill="#F5C400" />
        {/* pillars */}
        {[110, 132, 154, 176, 198].map((x) => (
          <rect
            key={x}
            x={x}
            y="150"
            width="8"
            height="60"
            rx="2"
            fill="none"
            stroke="#22A050"
            strokeWidth="2.5"
          />
        ))}
        {/* base steps */}
        <rect x="96" y="214" width="128" height="8" rx="3" fill="#F5C400" />
        <rect x="84" y="226" width="152" height="8" rx="3" fill="#22A050" />
        {/* book / education line */}
        <path
          d="M120 256 q40 -16 80 0"
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.5"
          strokeWidth="2.5"
        />
        <line
          x1="160"
          y1="248"
          x2="160"
          y2="262"
          stroke="#ffffff"
          strokeOpacity="0.5"
          strokeWidth="2.5"
        />
      </svg>

      {/* floating accents */}
      <div className="absolute right-2 top-6 h-12 w-12 animate-float rounded-lg border-2 border-gold/30 rotate-12" />
      <div className="absolute bottom-6 left-2 h-8 w-8 animate-float-slow rounded-full border-2 border-green/40" />
      <div className="absolute -right-2 bottom-16 h-3 w-3 rounded-full bg-gold/70" />
    </div>
  );
}

export function EventDetailsSection() {
  const mapQuery = encodeURIComponent(
    `${EVENT.venue.name}, ${EVENT.venue.institution}, ${EVENT.venue.city}`
  );

  return (
    <section
      id="details"
      className="relative overflow-hidden bg-navy py-20 text-white lg:py-28"
    >
      <div className="absolute inset-0 gradient-navy" aria-hidden />
      <div className="absolute inset-0 bg-dots opacity-30" aria-hidden />

      <div className="container-section relative grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* LEFT: info */}
        <Reveal>
          <p className="eyebrow text-gold">Event Details</p>
          <h2 className="heading-display mt-3 text-3xl sm:text-4xl lg:text-[2.75rem]">
            Everything you need to know
          </h2>

          <ul className="mt-8 space-y-5">
            {DETAILS.map((d) => (
              <li key={d.label} className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/5 text-gold">
                  <d.icon className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-label text-xs font-semibold uppercase tracking-[0.18em] text-green-400">
                    {d.label}
                  </p>
                  <p className="mt-0.5 font-medium text-white">{d.value}</p>
                </div>
              </li>
            ))}
          </ul>

          <Button
            href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
            external
            variant="primary"
            className="mt-9"
          >
            Get directions
            <ArrowRight className="h-5 w-5" />
          </Button>

          <p className="mt-6 text-sm text-white/55">
            Organised by {ORGANIZERS.map((o) => o.abbr).join(" · ")}
          </p>
        </Reveal>

        {/* RIGHT: decorative art */}
        <Reveal delay={0.12}>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <GeometricArt />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
