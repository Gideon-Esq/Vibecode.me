import { chromium } from "playwright";

const OUT = new URL("../app/opengraph-image.png", import.meta.url).pathname;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 1000 },
  deviceScaleFactor: 2,
});
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

// Find the vertical extent of the hero: from the top of the page down to just
// below the VENUE docket row, so the new venue text is guaranteed to be in frame.
const bottom = await page.evaluate(() => {
  const nodes = Array.from(document.querySelectorAll("*"));
  const venue = nodes.find(
    (n) => n.children.length === 0 && /VENUE/i.test(n.textContent || "")
  );
  if (!venue) return null;
  // walk up to the docket cell, then take the bottom of its value text
  const cell = venue.closest("div, li, td") || venue;
  const r = cell.getBoundingClientRect();
  return r.bottom;
});
console.log("venue docket bottom (css px):", bottom);

const height = 630;
// Anchor so the docket sits ~40px above the bottom edge of the 1200x630 frame.
let y = bottom ? Math.max(0, Math.round(bottom + 40 - height)) : 0;
console.log("clip y:", y);

await page.screenshot({
  path: OUT,
  clip: { x: 0, y, width: 1200, height },
});
await browser.close();
console.log("wrote", OUT);
