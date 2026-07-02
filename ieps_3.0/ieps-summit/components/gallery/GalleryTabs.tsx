"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon, CalendarClock } from "lucide-react";
import { EVENT } from "@/lib/constants";
import { PREVIOUS_EDITIONS, type GalleryPhoto } from "@/lib/gallery";
import { Lightbox } from "@/components/gallery/Lightbox";

/**
 * CSS/SVG illustration of a parliament chamber for the empty state.
 * A clean elevation: gold-crowned dome over a colonnade, with tiered
 * benches below — every element in its own band so nothing overlaps.
 */
function ParliamentArt() {
  const NAVY = "#0D1B5E";
  const NAVY_LIGHT = "#1A2D8A";
  const GOLD = "#F5C400";
  const GREEN = "#017E33";
  return (
    <svg
      viewBox="0 0 400 250"
      className="mx-auto h-auto w-full max-w-md"
      role="img"
      aria-label="Illustration of a parliament building"
    >
      {/* finial — gold orb on a stem reaching the dome apex */}
      <circle cx="200" cy="26" r="9" fill={GOLD} />
      <rect x="197.5" y="34" width="5" height="38" rx="2.5" fill={GOLD} />

      {/* dome — navy with a gold outline, sitting on its own drum */}
      <path d="M112 108 Q200 30 288 108 Z" fill={NAVY} />
      <path
        d="M112 108 Q200 30 288 108"
        fill="none"
        stroke={GOLD}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* drum beneath the dome */}
      <rect x="104" y="108" width="192" height="10" rx="5" fill={NAVY_LIGHT} />

      {/* pediment band */}
      <rect x="70" y="126" width="260" height="12" rx="6" fill={NAVY} />

      {/* colonnade — evenly spaced columns */}
      {Array.from({ length: 7 }).map((_, i) => (
        <rect
          key={i}
          x={92 + i * 34}
          y="144"
          width="10"
          height="46"
          rx="5"
          fill={NAVY_LIGHT}
        />
      ))}
      {/* green entrance door at the centre */}
      <rect x="188" y="158" width="24" height="32" rx="4" fill={GREEN} />

      {/* steps */}
      <rect x="76" y="196" width="248" height="9" rx="4.5" fill={NAVY_LIGHT} />
      <rect x="58" y="209" width="284" height="9" rx="4.5" fill={NAVY} />

      {/* forecourt dots — delegates gathering, alternating brand colours */}
      {Array.from({ length: 9 }).map((_, i) => (
        <circle
          key={i}
          cx={68 + i * 33}
          cy="230"
          r="3.5"
          fill={i % 3 === 0 ? GOLD : i % 3 === 1 ? NAVY_LIGHT : GREEN}
        />
      ))}

      {/* ground line */}
      <rect x="24" y="242" width="352" height="5" rx="2.5" fill={NAVY} />
    </svg>
  );
}

/** A single photo tile — optimized image with a hover zoom + caption reveal. */
function PhotoTile({
  photo,
  onOpen,
}: {
  photo: GalleryPhoto;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group relative block aspect-[4/3] overflow-hidden rounded-2xl bg-navy shadow-card ring-1 ring-navy/10 transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
        photo.featured ? "sm:col-span-2 sm:aspect-[16/9]" : ""
      }`}
      aria-label={`View photo: ${photo.alt}`}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes={
          photo.featured
            ? "(min-width:640px) 66vw, 100vw"
            : "(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
        }
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      />
      {/* caption gradient — appears on hover/focus */}
      <span
        className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/85 via-navy-950/30 to-transparent p-4 pt-10 text-left text-sm font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        {photo.alt}
      </span>
    </button>
  );
}

/** Placeholder shown for an edition whose photos aren't uploaded yet. */
function EmptyEditionTiles({ edition }: { edition: string }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="relative flex aspect-[4/3] flex-col items-center justify-center overflow-hidden rounded-2xl bg-navy text-center"
        >
          <div className="absolute inset-0 bg-dots opacity-30" aria-hidden />
          <ImageIcon className="relative h-8 w-8 text-white/30" />
          <span className="relative mt-2 font-display text-sm font-bold text-gold">
            {edition}
          </span>
          <span className="relative text-[10px] uppercase tracking-wider text-white/40">
            Photos soon
          </span>
        </div>
      ))}
    </div>
  );
}

export function GalleryTabs() {
  const [tab, setTab] = useState<"current" | "previous">("current");
  // Lightbox operates on one edition's photo list at a time.
  const [active, setActive] = useState<{
    photos: GalleryPhoto[];
    index: number;
  } | null>(null);

  const hasAnyPrevious = PREVIOUS_EDITIONS.some((e) => e.photos.length > 0);

  return (
    <div>
      {/* Tabs */}
      <div className="mx-auto flex w-full max-w-xs rounded-full border border-navy/10 bg-white p-1 shadow-card">
        {(
          [
            { id: "current", label: "IEPS 3.0" },
            { id: "previous", label: "Previous Editions" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t.id ? "bg-navy text-white" : "text-navy/60 hover:text-navy"
            }`}
            aria-pressed={tab === t.id}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-10">
        {tab === "current" ? (
          <div className="mx-auto max-w-2xl rounded-3xl border border-navy/10 bg-white p-8 text-center shadow-card sm:p-12">
            <ParliamentArt />
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-green/10 px-4 py-1.5 font-label text-xs font-semibold uppercase tracking-wide text-green-600">
              <CalendarClock className="h-4 w-4" />
              Coming soon
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold text-navy">
              Gallery coming soon
            </h2>
            <p className="mx-auto mt-2 max-w-md text-pretty text-ink/65">
              Photos from IEPS 3.0 will be uploaded after the event on{" "}
              <strong className="text-navy">{EVENT.dateLabel}</strong>. Check back
              once the summit wraps up.
            </p>
          </div>
        ) : (
          <div className="space-y-14">
            {!hasAnyPrevious && (
              <p className="text-center text-sm text-ink/55">
                A look back at previous editions. Photos will be added here soon.
              </p>
            )}

            {PREVIOUS_EDITIONS.map((ed) => (
              <section key={ed.edition}>
                {/* Edition heading */}
                <div className="mb-6 flex items-end justify-between gap-4 border-b border-navy/10 pb-3">
                  <h2 className="font-display text-xl font-bold text-navy sm:text-2xl">
                    {ed.edition}
                    {ed.year && (
                      <span className="ml-2 font-body text-base font-normal text-ink/45">
                        {ed.year}
                      </span>
                    )}
                  </h2>
                  {ed.photos.length > 0 && (
                    <span className="font-label text-xs font-semibold uppercase tracking-wider text-gold-600">
                      {ed.photos.length}{" "}
                      {ed.photos.length === 1 ? "photo" : "photos"}
                    </span>
                  )}
                </div>

                {ed.photos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {ed.photos.map((photo, i) => (
                      <PhotoTile
                        key={photo.src}
                        photo={photo}
                        onOpen={() =>
                          setActive({ photos: ed.photos, index: i })
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyEditionTiles edition={ed.edition} />
                )}
              </section>
            ))}
          </div>
        )}
      </div>

      <Lightbox
        photos={active?.photos ?? []}
        index={active?.index ?? null}
        onClose={() => setActive(null)}
        onNavigate={(index) =>
          setActive((prev) => (prev ? { ...prev, index } : prev))
        }
      />
    </div>
  );
}
