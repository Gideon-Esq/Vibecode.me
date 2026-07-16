import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SITE_URL } from "@/lib/constants";

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
 * absolute links in emails and certificates.
 *
 * Order:
 *   1. Explicit env (NEXT_PUBLIC_APP_URL / NEXTAUTH_URL / AUTH_URL) — set this
 *      in production to pin links to your real domain regardless of host.
 *   2. The incoming request host (x-forwarded-host) — resolves to the real
 *      domain on Vercel and to the Codespace URL when testing locally, so a
 *      generated link is always clickable in the environment that made it.
 *   3. The canonical SITE_URL, for non-request contexts.
 * Any path in an env value is stripped, so a misconfigured
 * `NEXTAUTH_URL=".../gallery"` can't leak in.
 */
export function getBaseUrl(request?: Request): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXTAUTH_URL ??
    process.env.AUTH_URL;
  if (fromEnv) {
    try {
      return new URL(fromEnv).origin;
    } catch {
      /* fall through to the request host */
    }
  }

  const host =
    request?.headers.get("x-forwarded-host") ?? request?.headers.get("host");
  if (host) {
    const proto =
      request?.headers.get("x-forwarded-proto") ??
      (host.includes("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  }

  return SITE_URL;
}
