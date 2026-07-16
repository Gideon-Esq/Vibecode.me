"use client";

import { useRef, type CSSProperties } from "react";
import { Icon } from "@/components/icon";

const DESTINATIONS = [
  { city: "Bali, Indonesia", from: "$1,000", best: "Apr - Oct", days: "7-10 days", photo: "dest-bali.jpg" },
  { city: "Tokyo, Japan", from: "$2,300", best: "Mar - May", days: "7-12 days", photo: "dest-tokyo.jpg" },
  { city: "Paris, France", from: "$2,100", best: "Apr - Jun", days: "7-10 days", photo: "dest-paris.jpg" },
  { city: "Dubai, UAE", from: "$1,600", best: "Nov - Mar", days: "4-7 days", photo: "dest-dubai.jpg" },
  { city: "Cape Town, SA", from: "$1,900", best: "Sep - Apr", days: "7-10 days", photo: "dest-cape-town.jpg" },
  { city: "Santorini, Greece", from: "$2,400", best: "May - Oct", days: "5-7 days", photo: "dest-santorini.jpg" },
  { city: "Zanzibar, Tanzania", from: "$1,300", best: "Jun - Oct", days: "5-8 days", photo: "dest-zanzibar.jpg" },
  { city: "New York, USA", from: "$1,800", best: "Apr - Jun", days: "4-6 days", photo: "dest-new-york.jpg" },
];

export function DestinationRail() {
  const rail = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    // One "page" is the visible width, less a card's worth so context carries over.
    el.scrollBy({ left: dir * Math.max(el.clientWidth - 180, 200), behavior: "smooth" });
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Previous destinations"
        onClick={() => scrollBy(-1)}
        className="absolute -left-1 top-1/2 z-10 hidden size-9 -translate-y-1/2 cursor-pointer place-items-center rounded-[7px] border border-line bg-white text-navy shadow-[0_8px_20px_rgba(10,22,51,0.1)] transition hover:bg-blue-soft sm:grid"
      >
        <Icon name="chevron_left" className="text-[18px]" />
      </button>

      <div
        ref={rail}
        className="dest-rail grid grid-flow-col gap-3 overflow-x-auto pb-2 sm:mx-7"
        style={{ gridAutoColumns: "minmax(210px, calc((100% - 60px) / 3))" }}
      >
        {DESTINATIONS.map((d) => (
          <article
            key={d.city}
            className="dest-card relative flex min-h-[140px] flex-col justify-end overflow-hidden rounded-lg bg-navy p-3.5 text-white shadow-[0_12px_22px_rgba(10,22,51,0.12)]"
            style={{ "--photo": `url('/assets/${d.photo}')` } as CSSProperties}
          >
            <h3 className="mb-0.5 text-[0.95rem] font-bold">{d.city}</h3>
            <p className="text-[0.75rem] font-semibold">From {d.from}</p>
            <small className="mt-1 block text-[0.75rem] font-semibold opacity-95">
              Best time: {d.best}
              <br />
              {d.days}
            </small>
          </article>
        ))}
      </div>

      <button
        type="button"
        aria-label="Next destinations"
        onClick={() => scrollBy(1)}
        className="absolute -right-1 top-1/2 z-10 hidden size-9 -translate-y-1/2 cursor-pointer place-items-center rounded-[7px] border border-line bg-white text-navy shadow-[0_8px_20px_rgba(10,22,51,0.1)] transition hover:bg-blue-soft sm:grid"
      >
        <Icon name="chevron_right" className="text-[18px]" />
      </button>
    </div>
  );
}
