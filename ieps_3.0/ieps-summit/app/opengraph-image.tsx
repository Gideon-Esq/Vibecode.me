import { readFileSync } from "fs";
import { join } from "path";

/** Explicit route handler for the social share image — see app/icon.tsx for why. */
export const runtime = "nodejs";
export const alt = "IEPS 3.0 — Ife Education Parliamentary Summit";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SOURCE = join(
  process.cwd(),
  "public",
  "branding",
  "opengraph-image-source.png"
);

export default function OpengraphImage() {
  const buffer = readFileSync(SOURCE);
  return new Response(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
