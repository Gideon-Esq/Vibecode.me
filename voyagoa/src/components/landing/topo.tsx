"use client";

import { useEffect, useRef } from "react";

/**
 * Topographic contour-line backdrop for the hero. Two organic "elevation"
 * clusters of nested contours, drawn as SVG strokes. The whole layer
 * parallaxes gently against scroll (direct style writes — no re-renders).
 */
export function TopoLines() {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      el.style.transform = `translateY(${window.scrollY * 0.18}px)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <svg
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full will-change-transform"
      viewBox="0 0 1440 820"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Right-side ridge cluster */}
      <g className="topo-group text-sea" opacity="0.16">
        <path className="topo-path" d="M1030 90c120-38 268-20 342 58 74 78 66 210-10 292s-206 96-322 62-190-118-186-212 56-162 176-200Z" />
        <path className="topo-path topo-d1" d="M1050 140c96-30 214-14 273 48 59 62 52 168-9 233s-164 77-257 50-152-95-149-170 46-131 142-161Z" />
        <path className="topo-path topo-d2" d="M1070 190c72-22 160-10 204 37 44 46 39 125-7 174s-122 57-192 37-113-71-111-127 34-99 106-121Z" />
        <path className="topo-path topo-d3" d="M1090 240c48-15 106-7 135 24 30 31 26 83-4 116s-81 38-127 25-75-47-74-85 22-65 70-80Z" />
        <path className="topo-path topo-d4" d="M1112 288c26-8 56-3 72 13 16 17 14 45-2 62s-43 21-68 14-40-25-39-45 12-36 37-44Z" />
      </g>

      {/* Left-side basin cluster */}
      <g className="topo-group text-ink" opacity="0.10">
        <path className="topo-path topo-d2" d="M60 520c-58 74-64 178-2 244 62 66 178 74 282 32s170-128 158-218-92-152-196-166-184 34-242 108Z" />
        <path className="topo-path topo-d3" d="M112 552c-45 58-50 139-2 190 49 52 139 58 220 25s133-100 124-170-72-119-153-130-144 27-189 85Z" />
        <path className="topo-path topo-d4" d="M164 584c-32 41-35 99-1 135 34 37 98 41 155 18s94-71 87-120-50-84-108-92-101 19-133 59Z" />
        <path className="topo-path topo-d1" d="M216 618c-19 25-21 59-1 81 21 22 59 25 93 11s57-43 53-72-30-51-65-56-61 11-80 36Z" />
      </g>

      {/* Faint connecting contour bands across the width */}
      <g className="text-ink" opacity="0.07">
        <path className="topo-path" d="M-40 300c180 40 320-60 500-40s260 120 440 110 300-110 540-70" />
        <path className="topo-path topo-d2" d="M-40 360c190 30 330-50 505-32s255 105 430 96 295-95 545-60" />
        <path className="topo-path topo-d4" d="M-40 420c200 20 340-40 510-24s250 90 420 82 290-80 550-50" />
      </g>

      {/* Dashed flight path with plane marker */}
      <g className="text-coral" opacity="0.55">
        <path
          className="flight-path"
          d="M180 640C420 520 680 660 900 540s340-260 430-330"
          strokeDasharray="3 10"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle r="4" fill="currentColor" stroke="none">
          <animateMotion
            dur="14s"
            repeatCount="indefinite"
            path="M180 640C420 520 680 660 900 540s340-260 430-330"
          />
        </circle>
      </g>
    </svg>
  );
}
