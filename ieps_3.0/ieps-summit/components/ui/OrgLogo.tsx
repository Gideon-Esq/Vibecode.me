"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Renders an organiser logo. Tries the real PNG first (dropped in by the
 * organisers at /logos/<org>.png) and gracefully falls back to the bundled
 * SVG placeholder if the PNG is missing — so the page never shows a broken
 * image.
 */
export function OrgLogo({
  src,
  fallback,
  alt,
  size = 88,
  className,
}: {
  src: string;
  fallback: string;
  alt: string;
  size?: number;
  className?: string;
}) {
  const [current, setCurrent] = useState(src);

  return (
    <Image
      src={current}
      alt={alt}
      width={size}
      height={size}
      // Served directly (no optimizer) so the missing-PNG -> SVG-fallback swap
      // works reliably and first-party SVGs render without optimizer SVG limits.
      unoptimized
      className={cn("h-full w-full object-contain", className)}
      onError={() => {
        if (current !== fallback) setCurrent(fallback);
      }}
    />
  );
}
