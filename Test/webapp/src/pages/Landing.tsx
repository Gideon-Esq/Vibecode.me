import {
  LandingNav,
  HeroSection,
  FeaturesSection,
  PromoSection,
  HowItWorksSection,
  PricingSection,
  CTASection,
  Footer
} from "@/components/landing";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PromoSection />
        <HowItWorksSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
