import Image from "next/image";
import { UserRound, UsersRound } from "lucide-react";
import { KEYNOTE_SPEAKERS, PANELISTS } from "@/lib/constants";
import { Reveal } from "@/components/ui/Reveal";

/** Framed portrait slot. Shows the real photo when provided in constants,
 *  otherwise a dignified placeholder — no fabricated faces or names. */
function PortraitFrame({
  photo,
  name,
}: {
  photo: string | null;
  name: string;
}) {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden border border-white/10 bg-navy-950">
      {/* inner gold hairline frame */}
      <div
        className="pointer-events-none absolute inset-3 z-10 border border-gold/30"
        aria-hidden
      />
      {photo ? (
        <Image
          src={photo}
          alt={`Portrait of ${name}`}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover"
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-white/25">
          <UserRound className="h-16 w-16" strokeWidth={1.25} aria-hidden />
          <span className="font-label text-[10px] font-semibold uppercase tracking-[0.28em]">
            Portrait forthcoming
          </span>
        </div>
      )}
    </div>
  );
}

/** Small circular medallion slot for a panelist — deliberately more modest
 *  than the keynote frames so the hierarchy of the day reads at a glance. */
function PanelistMedallion({
  photo,
  name,
}: {
  photo: string | null;
  name: string;
}) {
  return (
    <div className="relative h-32 w-32 overflow-hidden rounded-full border border-white/15 bg-navy-950 sm:h-36 sm:w-36">
      {/* inner gold hairline ring — echoes the keynote frames */}
      <div
        className="pointer-events-none absolute inset-1.5 z-10 rounded-full border border-gold/30"
        aria-hidden
      />
      {photo ? (
        <Image
          src={photo}
          alt={`Portrait of ${name}`}
          fill
          sizes="144px"
          className="object-cover"
        />
      ) : (
        <div className="grid h-full place-items-center text-white/25">
          <UserRound className="h-11 w-11" strokeWidth={1.25} aria-hidden />
        </div>
      )}
    </div>
  );
}

export function SpeakersSection() {
  return (
    <section
      id="speakers"
      className="relative scroll-mt-24 overflow-hidden bg-hero-aurora py-20 text-white lg:py-28"
    >
      <div className="absolute inset-0 bg-dots opacity-25" aria-hidden />

      <div className="container-section relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="font-label text-xs font-semibold uppercase tracking-[0.28em] text-gold">
            Distinguished Voices
          </p>
          <h2 className="heading-display mt-4 text-3xl sm:text-4xl lg:text-[2.75rem]">
            Keynote Speakers
          </h2>
          <div className="mx-auto mt-5 h-0.5 w-12 bg-gold" aria-hidden />
          <p className="mx-auto mt-6 text-pretty leading-relaxed text-white/65">
            Flagship addresses from distinguished voices on the role of
            parliamentarians in national and educational development. Speaker
            announcements are underway.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {KEYNOTE_SPEAKERS.map((speaker, i) => (
            <Reveal key={i} delay={i * 0.1} as="article">
              <div className="group mx-auto max-w-sm">
                <PortraitFrame photo={speaker.photo} name={speaker.name} />
                <div className="border-x border-b border-white/10 px-6 py-5 text-center">
                  <p className="font-label text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
                    {speaker.slot}
                  </p>
                  <h3 className="heading-display mt-2 text-xl text-white/90">
                    {speaker.name}
                  </h3>
                  <p className="mt-1 text-xs text-white/45">{speaker.detail}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* The Panel — smaller medallions under a ruled divider; the panel
            supports the keynotes, so its slots are deliberately more modest. */}
        <Reveal delay={0.15} className="mt-20">
          <div className="flex items-center gap-4" aria-hidden>
            <span className="h-px flex-1 bg-white/10" />
            <span className="inline-flex items-center gap-2 font-label text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
              <UsersRound className="h-4 w-4" strokeWidth={1.75} />
              The Panel
            </span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <p className="mx-auto mt-5 max-w-xl text-center text-sm leading-relaxed text-white/55">
            A cross-disciplinary panel of educators, lawmakers and student
            leaders. Panelist announcements are underway.
          </p>

          <ul className="mt-9 flex flex-wrap items-start justify-center gap-x-8 gap-y-8 sm:gap-x-12">
            {PANELISTS.map((panelist, i) => (
              <li key={i} className="flex w-32 flex-col items-center text-center sm:w-40">
                <PanelistMedallion photo={panelist.photo} name={panelist.name} />
                <p className="mt-3 font-label text-[9px] font-semibold uppercase tracking-[0.24em] text-gold/80">
                  {panelist.slot}
                </p>
                <p className="mt-1 text-xs text-white/60">{panelist.name}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
