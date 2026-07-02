"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

/** The public Navbar/Footer are hidden inside the /admin area. */
function isAdmin(pathname: string | null) {
  return Boolean(pathname && pathname.startsWith("/admin"));
}

export function ConditionalNavbar() {
  const pathname = usePathname();
  return isAdmin(pathname) ? null : <Navbar />;
}

export function ConditionalFooter() {
  const pathname = usePathname();
  return isAdmin(pathname) ? null : <Footer />;
}
