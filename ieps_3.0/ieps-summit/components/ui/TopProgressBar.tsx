"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * NProgress-style gold bar at the very top of the viewport. App Router doesn't
 * expose router events, so we animate a quick progress flourish whenever the
 * resolved pathname changes (i.e. a navigation has committed).
 */
export function TopProgressBar() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setPhase("loading");
    const toDone = setTimeout(() => setPhase("done"), 350);
    const toIdle = setTimeout(() => setPhase("idle"), 800);
    return () => {
      clearTimeout(toDone);
      clearTimeout(toIdle);
    };
  }, [pathname]);

  if (phase === "idle") return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[100] h-[3px]" aria-hidden>
      <div
        className={cn(
          "h-full bg-gold shadow-[0_0_8px_rgba(245,196,0,0.7)]",
          phase === "loading"
            ? "w-2/3 transition-[width] duration-300 ease-out"
            : "w-full opacity-0 transition-all duration-400 ease-in"
        )}
      />
    </div>
  );
}
