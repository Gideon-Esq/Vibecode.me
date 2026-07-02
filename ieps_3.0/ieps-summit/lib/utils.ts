import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
};

/** Milliseconds remaining (clamped at 0) between now and a target ISO date. */
export function getTimeLeft(targetISO: string, fromMs: number = Date.now()): TimeLeft {
  const total = Math.max(0, new Date(targetISO).getTime() - fromMs);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / (1000 * 60)) % 60);
  const seconds = Math.floor((total / 1000) % 60);
  return { days, hours, minutes, seconds, total };
}

/** Pad a number to two digits for clock-style display. */
export function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

/**
 * Resolve the public base ORIGIN (scheme + host, never a path) for building
 * absolute links in API routes. Order: explicit env → forwarded host (proxies
 * such as Codespaces/Vercel) → request origin. Any path in an env value is
 * stripped, so a misconfigured `NEXTAUTH_URL=".../gallery"` can't leak in.
 */
export function getBaseUrl(request: Request): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXTAUTH_URL ??
    process.env.AUTH_URL;
  if (fromEnv) {
    try {
      return new URL(fromEnv).origin;
    } catch {
      /* fall through to headers */
    }
  }

  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (host) {
    const proto =
      request.headers.get("x-forwarded-proto") ??
      (host.includes("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  }

  return new URL(request.url).origin;
}
