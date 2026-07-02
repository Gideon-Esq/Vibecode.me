import { readFileSync } from "fs";
import { join } from "path";

/** Explicit route handler for the Apple touch icon — see app/icon.tsx for why. */
export const runtime = "nodejs";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const SOURCE = join(process.cwd(), "public", "branding", "apple-icon-source.png");

export default function AppleIcon() {
  const buffer = readFileSync(SOURCE);
  return new Response(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
