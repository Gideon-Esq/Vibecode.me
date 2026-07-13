import Image from "next/image";
import { UserRound, UsersRound } from "lucide-react";
import { KEYNOTE_SPEAKERS, PANELISTS } from "@/lib/constants";
import { Reveal } from "@/components/ui/Reveal";

/** Framed portrait slot. Shows the real photo when provided in constants,
 *  otherwise a dignified placeholder — no fabricated faces or names. */
function PortraitFrame({
  photo,
  name,
  position = "center",
  scale = 1,
  fit = "cover",
}: {
  photo: string | null;
  name: string;
  /** object-position for the crop, e.g. "top" to keep the head in frame
   *  on a full-body portrait. */
  position?: string;
  /** extra zoom for full-body shots so the subject fills the frame like a
   *  head-and-shoulders portrait. Zooms around `position`. */
  scale?: number;
  /** "cover" fills/crops the frame; "contain" shows the whole photo
   *  uncropped (fitted inside the frame). */
  fit?: "cover" | "contain";
}) {
  return (
    <div className="relative aspect-[4/5] w-full border border-white/10 bg-navy-950 p-3">
      {/* gold hairline frame — the portrait is clipped inside it so the
          image never bleeds past the border */}
      <div className="relative h-full w-full overflow-hidden border border-gold/30 bg-navy-950">
        {photo ? (
          <Image
            src={photo}
            alt={`Portrait of ${name}`}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className={fit === "contain" ? "object-contain" : "object-cover"}
            style={{
              objectPosition: position,
              transform: scale !== 1 ? `scale(${scale})` : undefined,
              transformOrigin: position,
            }}
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
    </div>
  );
}

/** Small circular medallion slot for a panelist — deliberately more modest
 *  than the keynote frames so the hierarchy of the day reads at a glance. */
function PanelistMedallion({
  photo,
  name,
  position = "center",
  scale = 1,
}: {
  photo: string | null;
  name: string;
  position?: string;
  scale?: number;
}) {
  return (
    <div className="relative h-32 w-32 rounded-full border border-white/15 bg-navy-950 p-1.5 sm:h-36 sm:w-36">
      {/* gold hairline ring — the portrait is clipped inside it so the
          image never bleeds past the border */}
      <div className="relative h-full w-full overflow-hidden rounded-full border border-gold/30 bg-navy-950">
        {photo ? (
          <Image
            src={photo}
            alt={`Portrait of ${name}`}
            fill
            sizes="144px"
            className="object-cover"
            style={{
              objectPosition: position,
              transform: scale !== 1 ? `scale(${scale})` : undefined,
              transformOrigin: position,
            }}
          />
        ) : (
          <div className="grid h-full place-items-center text-white/25">
            <UserRound className="h-11 w-11" strokeWidth={1.25} aria-hidden />
          </div>
        )}
      </div>
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
            Headline addresses from leaders shaping how Nigeria&apos;s parliament
            drives education and national development.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {KEYNOTE_SPEAKERS.map((speaker, i) => (
            <Reveal key={i} delay={i * 0.1} as="article">
              <div className="group mx-auto max-w-sm">
                <PortraitFrame
                  photo={speaker.photo}
                  name={speaker.name}
                  position={speaker.position}
                  scale={speaker.scale}
                  fit={speaker.fit}
                />
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
            Educators, lawmakers and student leaders in one conversation,
            trading the kind of perspectives you won&apos;t hear anywhere else.
            More panelists to be announced.
          </p>

          <ul className="mt-9 flex flex-wrap items-start justify-center gap-x-8 gap-y-8 sm:gap-x-12">
            {PANELISTS.map((panelist, i) => (
              <li key={i} className="flex w-32 flex-col items-center text-center sm:w-40">
                <PanelistMedallion
                  photo={panelist.photo}
                  name={panelist.name}
                  position={panelist.position}
                  scale={panelist.scale}
                />
                <p className="mt-3 font-label text-[9px] font-semibold uppercase tracking-[0.24em] text-gold/80">
                  {panelist.slot}
                </p>
                <p className="mt-1 text-xs text-white/60">{panelist.name}</p>
                {panelist.detail ? (
                  <p className="mt-1 text-[11px] leading-snug text-white/40">
                    {panelist.detail}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
