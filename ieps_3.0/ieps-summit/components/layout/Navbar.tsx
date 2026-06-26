"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/** Text-based IEPS 3.0 wordmark — "IEPS" white, "3.0" gold superscript. */
function Wordmark() {
  return (
    <span className="flex items-baseline font-display font-bold leading-none">
      <span className="text-xl tracking-tight text-white sm:text-2xl">IEPS</span>
      <span className="ml-1 text-sm font-bold text-gold sm:text-base">3.0</span>
    </span>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => {
    // Hash links (e.g. "/#theme") aren't marked active — they scroll within a page.
    if (href.includes("#")) return false;
    return pathname === href;
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || open
          ? "bg-navy shadow-[0_8px_30px_-12px_rgba(8,15,58,0.8)]"
          : "bg-transparent"
      )}
    >
      <nav
        className={cn(
          "container mx-auto flex h-16 items-center justify-between px-5 transition-[height] duration-300 ease-out sm:px-6 lg:px-8",
          scrolled ? "lg:h-16" : "lg:h-20"
        )}
        aria-label="Primary"
      >
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label="IEPS 3.0 — home"
        >
          <Wordmark />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative rounded-full px-4 py-2 font-body text-sm font-medium transition-colors duration-200",
                  active ? "text-gold" : "text-white/80 hover:text-white"
                )}
              >
                {link.label}
                {/* gold active/hover underline */}
                <span
                  className={cn(
                    "pointer-events-none absolute inset-x-4 -bottom-0.5 h-0.5 origin-left rounded-full bg-gold transition-transform duration-200",
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  )}
                />
              </Link>
            );
          })}
          <Button href="/register" size="sm" className="ml-3">
            Register
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile full-screen slide-down menu (navy) */}
      <div
        id="mobile-menu"
        className={cn(
          "fixed inset-x-0 top-16 z-40 origin-top gradient-navy lg:hidden",
          open
            ? "pointer-events-auto h-[calc(100dvh-4rem)] opacity-100"
            : "pointer-events-none h-0 opacity-0"
        )}
        style={{ transition: "height 320ms ease, opacity 240ms ease" }}
      >
        <div className="container mx-auto flex h-full flex-col px-5 pb-10 pt-6">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link, i) => {
              const active = isActive(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-xl px-4 py-4 font-display text-2xl font-semibold transition-colors",
                      active
                        ? "text-gold"
                        : "text-white/90 hover:bg-white/5 hover:text-gold"
                    )}
                    style={
                      open
                        ? { animation: `fadeInUp 0.4s ease-out both`, animationDelay: `${i * 60}ms` }
                        : undefined
                    }
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <Button href="/register" size="lg" className="mt-auto w-full">
            Register Now
          </Button>
        </div>
      </div>
    </header>
  );
}
