"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon, CalendarClock } from "lucide-react";
import { EVENT } from "@/lib/constants";
import { PREVIOUS_EDITIONS, type GalleryPhoto } from "@/lib/gallery";
import { Lightbox } from "@/components/gallery/Lightbox";

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
            <Image
              src="/signatures/assets/image.png"
              alt="Gallery coming soon"
              width={480}
              height={320}
              className="mx-auto h-auto w-full max-w-md"
            />
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
