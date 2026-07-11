import { cn } from "@/components/ui";

/**
 * Google Material Symbols icon (self-hosted via next/font/google).
 * `name` is the symbol's ligature name, e.g. "flight", "hotel", "restaurant".
 * Browse names at fonts.google.com/icons.
 */
export function Icon({
  name,
  className,
  filled = false,
}: {
  name: string;
  className?: string;
  filled?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={cn("msi select-none", filled && "msi-filled", className)}
    >
      {name}
    </span>
  );
}
