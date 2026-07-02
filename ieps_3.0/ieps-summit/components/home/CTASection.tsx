import { Ticket, Handshake } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Sparkle } from "@/components/ui/Sparkle";

export function CTASection() {
  return (
    <section className="relative overflow-hidden stripe-band text-white">
      {/* dotted texture + top gold hairline */}
      <div className="absolute inset-0 bg-dots opacity-25" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-px gradient-gold opacity-70" aria-hidden />
      {/* floating brand sparkles */}
      <Sparkle className="animate-float-slow absolute left-[9%] top-[24%] h-9 w-9 text-gold/20" />
      <Sparkle className="animate-float absolute right-[11%] bottom-[22%] h-6 w-6 text-gold/15 [animation-delay:1.5s]" />

      <div className="container-section relative py-16 text-center lg:py-24">
        <Reveal className="mx-auto max-w-3xl">
          <p className="inline-flex items-center gap-2 font-label text-xs font-semibold uppercase tracking-[0.28em] text-gold">
            <Sparkle className="h-3 w-3" />
            Take Your Seat
          </p>
          <h2 className="heading-display mt-5 text-balance text-3xl sm:text-4xl lg:text-5xl">
            Ready to Shape Nigeria&apos;s Future?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/75 sm:text-lg">
            Join student parliamentarians from across Nigeria at IEPS 3.0.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              href="/register"
              size="lg"
              aria-label="Register for IEPS 3.0 — it is free"
            >
              <Ticket className="h-5 w-5" />
              Register Now — It&apos;s Free
            </Button>
            <Button
              href="/contact"
              variant="outline"
              size="lg"
              aria-label="Partner with IEPS 3.0 as a sponsor"
            >
              <Handshake className="h-5 w-5" />
              Sponsor the Summit
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
