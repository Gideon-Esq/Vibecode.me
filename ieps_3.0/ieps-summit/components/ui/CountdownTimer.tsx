"use client";

import { useEffect, useState } from "react";
import { getTimeLeft, pad, type TimeLeft } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Props = {
  targetISO: string;
  className?: string;
  /** "dark" for navy backgrounds (default), "light" for off-white sections */
  tone?: "dark" | "light";
};

const UNITS: { key: keyof Omit<TimeLeft, "total">; label: string }[] = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
];

export function CountdownTimer({ targetISO, className, tone = "dark" }: Props) {
  // Start null so SSR and first client render match (avoids hydration mismatch),
  // then populate on mount and tick every second.
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTime(getTimeLeft(targetISO));
    const id = setInterval(() => setTime(getTimeLeft(targetISO)), 1000);
    return () => clearInterval(id);
  }, [targetISO]);

  const isDark = tone === "dark";
  const expired = time !== null && time.total <= 0;

  return (
    <div
      className={cn(
        "flex flex-wrap items-stretch justify-center gap-2.5 sm:gap-4",
        className
      )}
      role="timer"
      aria-live="off"
      aria-label="Time remaining until IEPS 3.0"
      style={{ perspective: "600px" }}
    >
      {expired ? (
        <p
          className={cn(
            "font-display text-xl font-bold",
            isDark ? "text-gold" : "text-emerald"
          )}
        >
          The summit is here. Welcome to IEPS 3.0!
        </p>
      ) : (
        UNITS.map(({ key, label }) => (
          <div
            key={key}
            className={cn(
              "flex min-w-[68px] flex-col items-center rounded-2xl border px-3 py-3 sm:min-w-[84px] sm:px-4 sm:py-4",
              isDark
                ? "border-white/15 bg-white/5 backdrop-blur"
                : "border-navy/10 bg-white shadow-card"
            )}
          >
            {/* key on the value remounts the span so the flip animation
                replays each time the number changes (CSS 3D rotateX) */}
            <span
              key={time === null ? "init" : pad(time[key])}
              className={cn(
                "font-display text-3xl font-bold tabular-nums sm:text-4xl",
                time !== null && "animate-flip-in",
                isDark ? "text-white" : "text-navy"
              )}
              style={{ transformOrigin: "center bottom" }}
            >
              {time === null ? "––" : pad(time[key])}
            </span>
            <span
              className={cn(
                "mt-1 font-accent text-[10px] font-semibold uppercase tracking-[0.18em] sm:text-xs",
                isDark ? "text-gold" : "text-emerald"
              )}
            >
              {label}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
