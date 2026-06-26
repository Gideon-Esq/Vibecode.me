import { SITE_URL, EVENT } from "@/lib/constants";

/**
 * The canonical WhatsApp share message for IEPS 3.0 (used on the homepage CTA
 * and the registration success page).
 */
export const SHARE_MESSAGE = [
  "I just registered for IEPS 3.0 — Ife Education Parliamentary Summit! 🎓🏛️",
  "Date: July 22, 2026 | Venue: ACE, OAU",
  `Theme: ${EVENT.theme}`,
  `Register here: ${SITE_URL}/register`,
].join("\n");

/** Pre-filled WhatsApp share link. */
export function whatsappShareUrl(message: string = SHARE_MESSAGE): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
