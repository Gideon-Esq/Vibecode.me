import type { Metadata } from "next";
import { Mail, Phone, MapPin, User, ArrowRight, Instagram, Facebook } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ContactForm } from "@/components/contact/ContactForm";
import { EVENT, CONTACT, SOCIALS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the IEPS 3.0 organising team — questions, partnerships and press enquiries.",
};

export default function ContactPage() {
  const mapQuery = encodeURIComponent(
    `${EVENT.venue.name}, ${EVENT.venue.institution}, ${EVENT.venue.city}`
  );

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy pb-20 pt-28 text-white lg:pb-24 lg:pt-36">
        <div className="absolute inset-0 bg-hero-aurora" aria-hidden />
        <div className="absolute inset-0 bg-dots opacity-40" aria-hidden />
        <div className="container-section relative text-center">
          <Badge tone="light" className="mb-5">
            Get in touch
          </Badge>
          <h1 className="heading-display text-balance text-4xl sm:text-5xl lg:text-6xl">
            <span className="gold-underline text-gold">Contact</span> us
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-white/75">
            Questions about IEPS 3.0, partnerships or press? We&apos;d love to
            hear from you.
          </p>
        </div>
      </section>

      {/* Form + details */}
      <section className="bg-offwhite py-16 lg:py-24">
        <div className="container-section grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
          <ContactForm />

          <div className="space-y-6">
            {/* Contact details card */}
            <div className="rounded-3xl bg-navy p-7 text-white shadow-card">
              <h2 className="font-display text-lg font-bold text-gold">
                Contact details
              </h2>
              <ul className="mt-5 space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <User className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
                  <span>
                    <span className="font-semibold text-white">{CONTACT.name}</span>
                    <br />
                    <span className="text-white/60">{CONTACT.role}</span>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
                  <span>
                    <a
                      href={`mailto:${SOCIALS.email}`}
                      className="break-all transition-colors hover:text-gold"
                    >
                      {SOCIALS.email}
                    </a>
                    <br />
                    <a
                      href={`mailto:${CONTACT.email}`}
                      className="break-all text-white/60 transition-colors hover:text-gold"
                    >
                      {CONTACT.email}
                    </a>
                  </span>
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
                <li className="flex items-start gap-3">
                  <Instagram className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
                  <a
                    href={SOCIALS.instagram.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-gold"
                  >
                    {SOCIALS.instagram.handle}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Facebook className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
                  <a
                    href={SOCIALS.facebook.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-gold"
                  >
                    {SOCIALS.facebook.handle}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
                  <span>
                    {EVENT.venue.name}, {EVENT.venue.institution},{" "}
                    {EVENT.venue.city}, {EVENT.venue.state}
                  </span>
                </li>
              </ul>
            </div>

            {/* Map */}
            <div className="overflow-hidden rounded-3xl border border-navy/10 shadow-card">
              <iframe
                title={`Map to ${EVENT.venue.name}, ${EVENT.venue.institution}`}
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                className="h-56 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="flex items-center justify-between gap-3 bg-white px-5 py-3">
                <p className="text-sm font-medium text-navy">
                  {EVENT.venue.name}, OAU
                </p>
                <Button
                  href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                  external
                  size="sm"
                >
                  Directions
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
