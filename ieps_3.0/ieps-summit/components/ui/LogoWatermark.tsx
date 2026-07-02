import { cn } from "@/lib/utils";

type Props = {
  /** Extra positioning/size classes (e.g. "right-0 top-0 w-[34rem]"). */
  className?: string;
  /** "green" (legacy name) → navy on light sections; "white" for navy bands. */
  tone?: "green" | "white";
};

/**
 * Faint IEPS 3.0 wordmark used as a decorative watermark behind section
 * content. Drawn inline so colour/opacity follow the brand (navy on light
 * surfaces, white on navy bands). Purely decorative — hidden from a11y tree.
 */
export function LogoWatermark({ className, tone = "green" }: Props) {
  const stroke = tone === "white" ? "#FFFFFF" : "#0D1B5E";
  return (
    <div
      className={cn(
        "pointer-events-none absolute select-none",
        tone === "white" ? "opacity-[0.06]" : "opacity-[0.05]",
        className
      )}
      aria-hidden
    >
      <svg
        viewBox="0 0 520 120"
        className="h-auto w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outlined "IEPS" wordmark */}
        <text
          x="0"
          y="86"
          fontFamily="'Playfair Display', Georgia, serif"
          fontWeight={700}
          fontSize="92"
          letterSpacing="-1"
          fill="none"
          stroke={stroke}
          strokeWidth="2.5"
        >
          IEPS
        </text>
        {/* 3.0 plate outline */}
        <rect
          x="292"
          y="60"
          width="70"
          height="34"
          fill="none"
          stroke={stroke}
          strokeWidth="2.5"
        />
        <text
          x="327"
          y="84"
          fontFamily="'Playfair Display', Georgia, serif"
          fontWeight={700}
          fontSize="22"
          textAnchor="middle"
          fill={stroke}
        >
          3.0
        </text>
      </svg>
    </div>
  );
}
