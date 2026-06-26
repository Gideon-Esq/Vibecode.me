"use client";

import { useState } from "react";
import { ImageIcon, CalendarClock } from "lucide-react";
import { EVENT } from "@/lib/constants";

/** CSS/SVG illustration of a parliament chamber for the empty state. */
function ParliamentArt() {
  return (
    <svg
      viewBox="0 0 400 240"
      className="mx-auto h-auto w-full max-w-md"
      role="img"
      aria-label="Illustration of a parliament chamber"
    >
      {/* back wall arch */}
      <path d="M40 150 Q200 10 360 150 Z" fill="#0D1B5E" />
      <path d="M40 150 Q200 10 360 150" fill="none" stroke="#F5C400" strokeWidth="2" />
      {/* flag / emblem */}
      <circle cx="200" cy="58" r="12" fill="#F5C400" />
      <rect x="197" y="68" width="6" height="22" fill="#F5C400" />
      {/* speaker podium */}
      <rect x="180" y="150" width="40" height="40" rx="3" fill="#1A7A3C" />
      <rect x="190" y="138" width="20" height="14" rx="2" fill="#F5C400" />
      {/* tiered semicircular seats */}
      {[0, 1, 2, 3].map((row) => {
        const y = 160 + row * 18;
        const inset = 60 - row * 12;
        return (
          <g key={row}>
            <path
              d={`M${inset} ${y} Q200 ${y - 40} ${400 - inset} ${y}`}
              fill="none"
              stroke="#1a2d8a"
              strokeWidth="9"
              strokeLinecap="round"
            />
            {/* seat dots */}
            {Array.from({ length: 7 }).map((_, c) => {
              const t = (c + 1) / 8;
              const x = inset + t * (400 - 2 * inset);
              const arc = Math.sin(Math.PI * t) * 40;
              return (
                <circle
                  key={c}
                  cx={x}
                  cy={y - arc}
                  r="3"
                  fill={c % 2 === 0 ? "#F5C400" : "#22A050"}
                />
              );
            })}
          </g>
        );
      })}
      {/* floor */}
      <rect x="0" y="226" width="400" height="14" fill="#0D1B5E" />
    </svg>
  );
}

const PREVIOUS = [
  ...Array.from({ length: 6 }, (_, i) => ({ edition: "IEPS 2.0", n: i + 1 })),
  ...Array.from({ length: 6 }, (_, i) => ({ edition: "IEPS 1.0", n: i + 1 })),
];

export function GalleryTabs() {
  const [tab, setTab] = useState<"current" | "previous">("current");

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
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-1.5 font-label text-xs font-semibold uppercase tracking-wide text-gold-600">
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
          <div>
            <p className="mb-6 text-center text-sm text-ink/55">
              A look back at previous editions. Photos will be added here soon.
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {PREVIOUS.map((item, i) => (
                <div
                  key={i}
                  className="group relative flex aspect-[4/3] flex-col items-center justify-center overflow-hidden rounded-2xl bg-navy text-center"
                >
                  <div className="absolute inset-0 bg-dots opacity-30" aria-hidden />
                  <ImageIcon className="relative h-8 w-8 text-white/30" />
                  <span className="relative mt-2 font-display text-sm font-bold text-gold">
                    {item.edition}
                  </span>
                  <span className="relative text-[10px] uppercase tracking-wider text-white/40">
                    Photo {item.n}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
