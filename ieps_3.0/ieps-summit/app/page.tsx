import { HeroSection } from "@/components/home/HeroSection";
import { AboutSection } from "@/components/home/AboutSection";
import { ThemeSection } from "@/components/home/ThemeSection";
import { SpeakersSection } from "@/components/home/SpeakersSection";
import { ProgrammeHighlights } from "@/components/home/ProgrammeHighlights";
import { EventDetailsSection } from "@/components/home/EventDetailsSection";
import { OrganizersSection } from "@/components/home/OrganizersSection";
import { SponsorsSection } from "@/components/home/SponsorsSection";
import { CTASection } from "@/components/home/CTASection";
import { EVENT, ORGANIZERS, SOCIALS, SITE_URL } from "@/lib/constants";

/**
 * schema.org Event structured data — lets Google show a rich event card
 * (name, date, venue, free tickets) directly in search results.
 */
const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationEvent",
  name: EVENT.name,
  description: `${EVENT.theme}. ${EVENT.tagline}`,
  startDate: "2026-07-22T09:00:00+01:00",
  endDate: "2026-07-22T18:00:00+01:00",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  image: [`${SITE_URL}/opengraph-image.png`],
  location: {
    "@type": "Place",
    name: EVENT.venue.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: EVENT.venue.institution,
      addressLocality: EVENT.venue.city,
      addressRegion: EVENT.venue.state,
      addressCountry: "NG",
    },
  },
  organizer: ORGANIZERS.map((org) => ({
    "@type": "Organization",
    name: org.name,
  })),
  offers: {
    "@type": "Offer",
    url: `${SITE_URL}/register`,
    price: "0",
    priceCurrency: "NGN",
    availability: "https://schema.org/InStock",
    validFrom: "2026-01-01T00:00:00+01:00",
  },
} as const;

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Education Students' Representative Council, OAU",
  alternateName: "ESRC OAU",
  url: SITE_URL,
  logo: `${SITE_URL}/logos/ieps.png`,
  email: SOCIALS.email,
  sameAs: [SOCIALS.instagram.url, SOCIALS.facebook.url],
} as const;

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <HeroSection />
      <ThemeSection />
      <AboutSection />
      <SpeakersSection />
      <ProgrammeHighlights />
      <EventDetailsSection />
      <OrganizersSection />
      <SponsorsSection />
      <CTASection />
    </>
  );
}
