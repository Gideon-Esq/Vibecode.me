import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, CalendarDays, Instagram, Facebook } from "lucide-react";
import { EVENT, ORGANIZERS, SOCIALS } from "@/lib/constants";
import { OrgLogo } from "@/components/ui/OrgLogo";

const FOOTER_LINKS = [
  { label: "About", href: "/about" },
  { label: "Programme", href: "/programme" },
  { label: "Register", href: "/register" },
  { label: "Certificate", href: "/certificate" },
  { label: "Contact", href: "/contact", external: false },
];

const SOCIAL_LINKS = [
  {
    label: SOCIALS.instagram.label,
    handle: SOCIALS.instagram.handle,
    href: SOCIALS.instagram.url,
    Icon: Instagram,
    external: true,
  },
  {
    label: SOCIALS.facebook.label,
    handle: SOCIALS.facebook.handle,
    href: SOCIALS.facebook.url,
    Icon: Facebook,
    external: true,
  },
  {
    label: "Email",
    handle: SOCIALS.email,
    href: `mailto:${SOCIALS.email}`,
    Icon: Mail,
    external: false,
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-navy-dark text-white/80">
      <div className="absolute inset-0 bg-dots opacity-40" aria-hidden />
      <div className="container-section relative py-14 lg:py-20">
        <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr]">
          {/* Brand + blurb */}
          <div className="sm:col-span-2 lg:col-span-1">
            {/* Logo sits on a white card — the mark's navy lettering would
                otherwise disappear against the dark navy footer. */}
            <span className="inline-flex rounded-xl bg-white px-4 py-3 shadow-sm">
              <Image
                src="/logos/ieps.png"
                alt="IEPS 3.0 | Ife Education Parliamentary Summit"
                width={416}
                height={81}
                className="h-10 w-auto"
              />
            </span>
            <p className="mt-5 max-w-sm text-pretty text-sm leading-relaxed text-white/65">
              {EVENT.tagline} The summit convenes student leaders, educators and
              parliamentarians to drive educational reform and nation building.
            </p>

            {/* Organiser & partner logos row */}
            <div className="mt-6 flex items-center gap-3">
              {ORGANIZERS.map((org) => (
                <span
                  key={org.abbr}
                  className="grid h-12 w-12 place-items-center rounded-full bg-white/95 p-1.5"
                  title={org.name}
                >
                  <OrgLogo
                    src={org.logo}
                    fallback={org.fallback}
                    alt={`${org.abbr} logo`}
                    size={40}
                  />
                </span>
              ))}
              {/* ESAN — partner logo (kept in the footer only, not in the
                  "Organised by" credit) */}
              <span
                className="grid h-12 w-12 place-items-center rounded-full bg-white/95 p-1.5"
                title="Education Students' Association of Nigeria"
              >
                <OrgLogo
                  src="/logos/esan.png"
                  fallback="/logos/esan.svg"
                  alt="ESAN logo"
                  size={40}
                />
              </span>
            </div>
          </div>

          {/* Quick links */}
          <nav aria-label="Footer">
            <h2 className="font-label text-sm font-semibold uppercase tracking-[0.2em] text-gold">
              Explore
            </h2>
            <ul className="mt-5 space-y-3 text-sm">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a
                      href={link.href}
                      className="text-white/70 transition-colors hover:text-gold"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-white/70 transition-colors hover:text-gold"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h2 className="font-label text-sm font-semibold uppercase tracking-[0.2em] text-gold">
              Get in touch
            </h2>
            <ul className="mt-5 space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                <span>{EVENT.dateLabel}</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                <span>
                  {EVENT.venue.name}, {EVENT.venue.institution},{" "}
                  {EVENT.venue.city}, {EVENT.venue.state}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                <a
                  href={`mailto:${SOCIALS.email}`}
                  className="break-all transition-colors hover:text-gold"
                >
                  {SOCIALS.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-6 border-t border-white/10 pt-6 sm:flex-row sm:justify-between">
          <p className="order-2 text-center text-xs text-white/55 sm:order-1 sm:text-left">
            &copy; 2026 IEPS 3.0 | Education Students&apos; Representative Council,
            OAU
          </p>
          <div className="order-1 flex items-center gap-3 sm:order-2">
            {SOCIAL_LINKS.map(({ label, handle, href, Icon, external }) => (
              <a
                key={label}
                href={href}
                aria-label={`: `}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-gold hover:text-gold"
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* bottom gold line accent */}
      <div className="h-1 w-full gradient-gold" aria-hidden />
    </footer>
  );
}
