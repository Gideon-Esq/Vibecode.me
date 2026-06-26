import { HeroSection } from "@/components/home/HeroSection";
import { AboutSection } from "@/components/home/AboutSection";
import { ThemeSection } from "@/components/home/ThemeSection";
import { ProgrammeHighlights } from "@/components/home/ProgrammeHighlights";
import { EventDetailsSection } from "@/components/home/EventDetailsSection";
import { OrganizersSection } from "@/components/home/OrganizersSection";
import { CTASection } from "@/components/home/CTASection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ThemeSection />
      <ProgrammeHighlights />
      <EventDetailsSection />
      <OrganizersSection />
      <CTASection />
    </>
  );
}
