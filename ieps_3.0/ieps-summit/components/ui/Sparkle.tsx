import { cn } from "@/lib/utils";

type Props = {
  /** Size / colour / positioning utilities (e.g. "h-4 w-4 text-gold"). */
  className?: string;
};

/**
 * Six-point brand sparkle — a small parliamentary "order-paper" flourish used
 * as a decorative accent beside eyebrows/rules and as faint floating ambient
 * marks on section backgrounds. Purely decorative: hidden from the a11y tree.
 *
 * Colour follows `currentColor` (set via a `text-*` class); size defaults to
 * 1.5rem and is overridable through `className`.
 */
export function Sparkle({ className }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-6 w-6 shrink-0", className)}
      fill="currentColor"
      aria-hidden
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 0 13.25 9.83 22.39 6 14.5 12 22.39 18 13.25 14.17 12 24 10.75 14.17 1.61 18 9.5 12 1.61 6 10.75 9.83Z" />
    </svg>
  );
}
