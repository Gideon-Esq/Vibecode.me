import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "gold" | "emerald" | "navy" | "light" | "outline";

const tones: Record<Tone, string> = {
  gold: "bg-gold/10 text-gold-600 border-gold/40",
  emerald: "bg-gold/10 text-gold-600 border-gold/40",
  navy: "bg-navy/5 text-navy border-navy/15",
  light: "bg-white/10 text-white border-white/20",
  outline: "bg-transparent text-white border-white/30",
};

export function Badge({
  children,
  tone = "gold",
  className,
  withDot = false,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  withDot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-none border px-3 py-1 font-accent text-xs font-semibold uppercase tracking-[0.18em]",
        tones[tone],
        className
      )}
    >
      {withDot && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-current opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      )}
      {children}
    </span>
  );
}
