import { Ticket, Share2 } from "lucide-react";
import { CONTACT } from "@/lib/constants";
import { whatsappShareUrl } from "@/lib/share";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function CTASection() {
  return (
    <section className="relative overflow-hidden gradient-gold">
      {/* subtle navy texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(#0D1B5E 1.2px, transparent 1.2px)",
          backgroundSize: "20px 20px",
        }}
        aria-hidden
      />
      <div className="container-section relative py-16 text-center lg:py-24">
        <Reveal className="mx-auto max-w-3xl">
          <h2 className="heading-display text-balance text-3xl text-navy sm:text-4xl lg:text-5xl">
            Ready to Shape Nigeria&apos;s Future?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-base font-medium leading-relaxed text-navy/80 sm:text-lg">
            Join student parliamentarians from across Nigeria at IEPS 3.0.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              href="/register"
              variant="secondary"
              size="lg"
              className="bg-navy text-white hover:bg-navy-light"
              aria-label="Register for IEPS 3.0 — it is free"
            >
              <Ticket className="h-5 w-5" />
              Register Now — It&apos;s Free
            </Button>
            <Button
              href={whatsappShareUrl()}
              external
              variant="secondary"
              size="lg"
              className="bg-green text-white hover:bg-green-dark"
              aria-label="Share IEPS 3.0 on WhatsApp"
            >
              <Share2 className="h-5 w-5" />
              Share on WhatsApp
            </Button>
          </div>

          <p className="mt-6 text-sm text-navy/70">
            Questions? Contact {CONTACT.name} —{" "}
            <a
              href={`mailto:${CONTACT.email}`}
              className="font-semibold text-navy underline-offset-2 hover:underline"
            >
              {CONTACT.email}
            </a>{" "}
            ·{" "}
            <a
              href={`tel:${CONTACT.phoneIntl}`}
              className="font-semibold text-navy underline-offset-2 hover:underline"
            >
              {CONTACT.phone}
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
