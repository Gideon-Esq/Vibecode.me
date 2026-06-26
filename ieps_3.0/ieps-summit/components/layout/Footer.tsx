import Link from "next/link";
import { Mail, Phone, MapPin, CalendarDays } from "lucide-react";
import { EVENT, CONTACT, ORGANIZERS } from "@/lib/constants";
import { OrgLogo } from "@/components/ui/OrgLogo";

const FOOTER_LINKS = [
  { label: "About", href: "/about" },
  { label: "Programme", href: "/programme" },
  { label: "Register", href: "/register" },
  { label: "Contact", href: "/contact", external: false },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-navy-dark text-white/80">
      <div className="absolute inset-0 bg-dots opacity-40" aria-hidden />
      <div className="container-section relative py-14 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1.1fr]">
          {/* Brand + blurb */}
          <div>
            <span className="flex items-baseline font-display font-bold leading-none">
              <span className="text-3xl tracking-tight text-white">IEPS</span>
              <span className="ml-1.5 text-xl text-gold">3.0</span>
            </span>
            <p className="mt-2 font-label text-sm uppercase tracking-[0.18em] text-green-400">
              Ife Education Parliamentary Summit
            </p>
            <p className="mt-5 max-w-sm text-pretty text-sm leading-relaxed text-white/65">
              {EVENT.tagline} The summit convenes student leaders, educators and
              parliamentarians to drive educational reform and nation building.
            </p>

            {/* Organiser logos row */}
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
                <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
                <span>{EVENT.dateLabel}</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
                <span>
                  {EVENT.venue.name}, {EVENT.venue.institution},{" "}
                  {EVENT.venue.city}, {EVENT.venue.state}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="break-all transition-colors hover:text-gold"
                >
                  {CONTACT.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
                <a
                  href={`tel:${CONTACT.phoneIntl}`}
                  className="transition-colors hover:text-gold"
                >
                  {CONTACT.phone}
                </a>
              </li>
            </ul>
            <p className="mt-4 text-xs text-white/50">
              {CONTACT.name} — {CONTACT.role}
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-xs text-white/55">
          <p>
            &copy; 2026 IEPS 3.0 | Education Students&apos; Representative Council,
            OAU
          </p>
        </div>
      </div>

      {/* bottom gold line accent */}
      <div className="h-1.5 w-full gradient-gold" aria-hidden />
    </footer>
  );
}
