import type { Metadata } from "next";
import { Badge } from "@/components/ui/Badge";
import { CertificateFinder } from "@/components/certificate/CertificateFinder";
import { EVENT } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Certificate of Participation",
  description:
    "Search for your name and download your IEPS 3.0 Certificate of Participation.",
};

export default function CertificatePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy pb-20 pt-28 text-white lg:pb-24 lg:pt-36">
        <div className="absolute inset-0 bg-hero-aurora" aria-hidden />
        <div className="absolute inset-0 bg-dots opacity-40" aria-hidden />
        <div className="container-section relative text-center">
          <Badge tone="light" className="mb-5">
            {EVENT.shortName} · Certificates
          </Badge>
          <h1 className="heading-display text-balance text-4xl sm:text-5xl lg:text-6xl">
            Get your{" "}
            <span className="gold-underline text-gold">certificate</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-white/75">
            Search for your name to find and download your Certificate of
            Participation from the {EVENT.name}.
          </p>
        </div>
      </section>

      {/* Finder */}
      <section className="bg-offwhite py-16 lg:py-24">
        <div className="container-section">
          <CertificateFinder />
        </div>
      </section>
    </>
  );
}
