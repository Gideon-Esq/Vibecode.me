"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Mail,
  Home,
  CalendarDays,
  MapPin,
  Share2,
  UsersRound,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EVENT } from "@/lib/constants";
import { DELEGATE_WHATSAPP_GROUP_URL } from "@/lib/share";
import { AttendanceBadge } from "@/components/register/AttendanceBadge";

type StoredRegistration = {
  id: string;
  fullName: string;
  email: string;
  institution: string;
  role: string;
  sessions: string[];
  emailSent: boolean;
};

function AnimatedCheck() {
  const reduce = useReducedMotion();
  return (
    <div className="relative mx-auto grid h-28 w-28 place-items-center">
      <span className="absolute inset-0 animate-pulse-ring rounded-full bg-green/30" aria-hidden />
      <span className="absolute inset-2 rounded-full bg-green" aria-hidden />
      <svg
        viewBox="0 0 52 52"
        className="relative h-16 w-16"
        role="img"
        aria-label="Success"
      >
        <motion.path
          d="M14 27 l8 8 l16 -18"
          fill="none"
          stroke="#fff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
        />
      </svg>
    </div>
  );
}

export default function RegistrationSuccessPage() {
  const [reg, setReg] = useState<StoredRegistration | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("ieps:registration");
      if (raw) setReg(JSON.parse(raw) as StoredRegistration);
    } catch {
      // ignore malformed/absent storage
    }
  }, []);

  const whatsappUrl = DELEGATE_WHATSAPP_GROUP_URL;

  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-navy px-5 py-28 text-white">
      <div className="absolute inset-0 bg-hero-aurora" aria-hidden />
      <div className="absolute inset-0 bg-dots opacity-40" aria-hidden />
      <div
        className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-green/20 blur-3xl"
        aria-hidden
      />
      <div
        className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-gold/15 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-xl text-center">
        <AnimatedCheck />

        <h1 className="heading-display mt-7 text-3xl sm:text-4xl">
          You&apos;re <span className="text-gold">registered!</span>
        </h1>
        <p className="mx-auto mt-3 max-w-md text-pretty text-white/75">
          {reg ? (
            <>
              Thank you, <strong className="text-white">{reg.fullName}</strong>.
              Your place at IEPS 3.0 is confirmed.
            </>
          ) : (
            <>Your place at IEPS 3.0 is confirmed.</>
          )}
        </p>

        {/* Email note */}
        <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80">
          <Mail className="h-4 w-4 text-gold" />
          {reg && !reg.emailSent
            ? "We'll email your confirmation shortly."
            : "Check your email for your confirmation."}
        </div>

        {/* Details summary */}
        <div className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur">
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 shrink-0 text-gold" />
              <span>{EVENT.dateLabel} · {EVENT.timeLabel}</span>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <span>
                {EVENT.venue.name}, {EVENT.venue.institution}, {EVENT.venue.city}
              </span>
            </div>
            {reg && (
              <>
                <div className="flex items-start gap-3">
                  <Ticket className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                  <span>
                    {reg.role}
                    {reg.institution ? ` · ${reg.institution}` : ""}
                  </span>
                </div>
                {reg.sessions?.length > 0 && (
                  <div className="border-t border-white/10 pt-3 text-white/70">
                    <span className="font-label text-xs uppercase tracking-[0.14em] text-green-400">
                      Sessions:{" "}
                    </span>
                    {reg.sessions.join(", ")}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 rounded-2xl border border-gold/20 bg-gold/10 p-5 text-left backdrop-blur">
          <div className="flex items-start gap-3">
            <UsersRound className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
            <div className="min-w-0 flex-1">
              <p className="font-label text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
                Delegate WhatsApp Group
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/75">
                Join the delegate WhatsApp group for more information and live
                updates about IEPS 3.0.
              </p>
              <Button
                href={whatsappUrl}
                external
                variant="primary"
                size="lg"
                className="mt-4 w-full sm:w-auto"
              >
                <Share2 className="h-5 w-5" />
                Join Delegate WhatsApp Group
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/" variant="outline" size="lg">
            <Home className="h-5 w-5" />
            Back to Home
          </Button>
        </div>

        {/* Personalised "I will be attending" share graphic */}
        <div className="mt-10">
          <AttendanceBadge defaultName={reg?.fullName ?? ""} />
        </div>
      </div>
    </section>
  );
}
