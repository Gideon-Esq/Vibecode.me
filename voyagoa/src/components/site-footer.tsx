"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * Visibility gate for the marketing footer. The footer belongs to the public
 * landing surfaces only, so it is suppressed on the signed-in app pages (the
 * trip dashboard and its detail views) to keep the dashboard self-contained.
 *
 * The footer is passed in as `children` (a server-rendered node) rather than
 * imported here, so this client boundary stays free of the footer's server-only
 * dependency chain (auth/db via the shared Brand/Nav module).
 */
const APP_PREFIXES = ["/trips"];

export function FooterGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isApp = APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (isApp) return null;
  return <>{children}</>;
}
