import { readFileSync } from "fs";
import { join } from "path";

/**
 * Explicit route handler for the app icon, reading a pre-rendered PNG from
 * /public/branding. A plain static `app/icon.png` file relies on Next's
 * implicit metadata-file convention, which — on this Vercel deployment —
 * wasn't making it into the build output (404 in production despite working
 * locally and being present in the deployed commit). Serving it from an
 * explicit handler instead sidesteps that: /public assets are always
 * deployed as-is, so this route can't silently drop out of the build.
 */
export const runtime = "nodejs";
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

const SOURCE = join(process.cwd(), "public", "branding", "icon-source.png");

export default function Icon() {
  const buffer = readFileSync(SOURCE);
  return new Response(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
