"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

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
        "fixed inset-x-0 top-0 z-50 border-b bg-white/95 backdrop-blur-md transition-all duration-300",
        scrolled || open
          ? "border-navy/10 shadow-[0_8px_30px_-18px_rgba(7,20,39,0.5)]"
          : "border-navy/5"
      )}
    >
      {/* gold hairline across the very top — chamber trim */}
      <div className="h-0.5 w-full gradient-gold" aria-hidden />
      <nav
        className={cn(
          "container mx-auto flex h-16 items-center justify-between px-5 transition-[height] duration-300 ease-out sm:px-6 lg:px-8",
          scrolled ? "lg:h-16" : "lg:h-20"
        )}
        aria-label="Primary"
      >
        <Link
          href="/"
          className="flex items-center"
          aria-label="IEPS 3.0 home"
        >
          <Image
            src="/logos/ieps.png"
            alt="IEPS 3.0 | Ife Education Parliamentary Summit"
            width={416}
            height={81}
            priority
            className="h-9 w-auto sm:h-11"
          />
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
                  "group relative px-4 py-2 font-label text-xs font-semibold uppercase tracking-[0.16em] transition-colors duration-200",
                  active ? "text-navy" : "text-ink/60 hover:text-navy"
                )}
              >
                {link.label}
                {/* gold active/hover underline */}
                <span
                  className={cn(
                    "pointer-events-none absolute inset-x-4 -bottom-0.5 h-0.5 origin-left bg-gold transition-transform duration-200",
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  )}
                />
              </Link>
            );
          })}
          <Button href="/register" size="sm" className="ml-4">
            Register
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-11 w-11 items-center justify-center text-navy transition-colors hover:bg-navy/5 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile full-screen slide-down menu */}
      <div
        id="mobile-menu"
        className={cn(
          "fixed inset-x-0 top-16 z-40 origin-top bg-white lg:hidden",
          open
            ? "pointer-events-auto h-[calc(100dvh-4rem)] opacity-100"
            : "pointer-events-none h-0 opacity-0"
        )}
        style={{ transition: "height 320ms ease, opacity 240ms ease" }}
      >
        <div className="container mx-auto flex h-full flex-col px-5 pb-10 pt-6">
          <ul className="flex flex-col">
            {NAV_LINKS.map((link, i) => {
              const active = isActive(link.href);
              return (
                <li key={link.href} className="border-b border-navy/10">
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center justify-between px-2 py-5 font-display text-2xl font-semibold transition-colors",
                      active
                        ? "text-gold-600"
                        : "text-navy hover:text-gold-600"
                    )}
                    style={
                      open
                        ? { animation: `fadeInUp 0.4s ease-out both`, animationDelay: `${i * 60}ms` }
                        : undefined
                    }
                  >
                    {link.label}
                    <span
                      className={cn("h-0.5 w-6 bg-gold", !active && "opacity-0")}
                      aria-hidden
                    />
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
