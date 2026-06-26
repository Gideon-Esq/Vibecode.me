import type { Metadata } from "next";
import { Badge } from "@/components/ui/Badge";
import { GalleryTabs } from "@/components/gallery/GalleryTabs";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Highlights from the Ife Education Parliamentary Summit. Photos from IEPS 3.0 arrive after 22nd July 2026.",
};

export default function GalleryPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy pb-20 pt-28 text-white lg:pb-24 lg:pt-36">
        <div className="absolute inset-0 gradient-navy" aria-hidden />
        <div className="absolute inset-0 bg-dots opacity-40" aria-hidden />
        <div className="container-section relative text-center">
          <Badge tone="light" className="mb-5">
            Moments &amp; Memories
          </Badge>
          <h1 className="heading-display text-balance text-4xl sm:text-5xl lg:text-6xl">
            <span className="gold-underline text-gold">Gallery</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-white/75">
            A visual journey through the Ife Education Parliamentary Summit.
          </p>
        </div>
      </section>

      {/* Tabs + content */}
      <section className="bg-offwhite py-16 lg:py-24">
        <div className="container-section">
          <GalleryTabs />
        </div>
      </section>
    </>
  );
}
