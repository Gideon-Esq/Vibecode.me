"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, Download, ImageOff, RefreshCw } from "lucide-react";
import { EVENT } from "@/lib/constants";

/* Brand colours — chamber navy + parliamentary gold + logo green */
const NAVY = "#0D1B5E";
const NAVY_DEEP = "#060B33";
const NAVY_LIGHT = "#1A2D8A";
const GOLD = "#F5C400";
const GREEN = "#14A24A"; // brand green (light) — reads well on navy

const SIZE = 1080;

/** Cover-fit an image inside a square of side 2r centred at (cx, cy). */
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number,
  cy: number,
  r: number
) {
  const scale = Math.max((2 * r) / img.width, (2 * r) / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/** Rotated rounded-square "blob" decoration. */
function blob(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  angleDeg: number,
  color: string
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((angleDeg * Math.PI) / 180);
  roundRect(ctx, -size / 2, -size / 2, size, size, size * 0.36);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "IE";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function setLetterSpacing(ctx: CanvasRenderingContext2D, value: string) {
  if ("letterSpacing" in ctx) {
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
      value;
  }
}

/* ── mini vector icons (drawn in gold inside navy chips) ──────── */
function iconCalendar(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  roundRect(ctx, x - 13, y - 10, 26, 23, 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 13, y - 2);
  ctx.lineTo(x + 13, y - 2);
  ctx.moveTo(x - 6, y - 14);
  ctx.lineTo(x - 6, y - 6);
  ctx.moveTo(x + 6, y - 14);
  ctx.lineTo(x + 6, y - 6);
  ctx.stroke();
  ctx.restore();
}
function iconPin(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.strokeStyle = GOLD;
  ctx.fillStyle = GOLD;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y - 4, 9, Math.PI, 0);
  ctx.lineTo(x, y + 13);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y - 4, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
function iconClock(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(x, y, 12, 0, Math.PI * 2);
  ctx.moveTo(x, y - 6);
  ctx.lineTo(x, y);
  ctx.lineTo(x + 6, y + 3);
  ctx.stroke();
  ctx.restore();
}

export function AttendanceBadge({ defaultName = "" }: { defaultName?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [name, setName] = useState(defaultName);
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [fontsReady, setFontsReady] = useState(false);
  const [logo, setLogo] = useState<HTMLImageElement | null>(null);
  const [sponsorLogo, setSponsorLogo] = useState<HTMLImageElement | null>(null);

  // Load the official IEPS logo for the canvas header (same-origin asset).
  useEffect(() => {
    const img = new Image();
    img.onload = () => setLogo(img);
    img.src = "/logos/ieps.png";
  }, []);

  // Load the sponsor logo for the header's sponsor slot.
  useEffect(() => {
    const img = new Image();
    img.onload = () => setSponsorLogo(img);
    img.src = "/logos/sponsors/dynage.png";
  }, []);

  useEffect(() => {
    if (defaultName) setName(defaultName);
  }, [defaultName]);

  // Wait for brand webfonts so the canvas text matches the site.
  useEffect(() => {
    let active = true;
    const done = () => active && setFontsReady(true);
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(done).catch(done);
    } else {
      done();
    }
    return () => {
      active = false;
    };
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const body = "'Inter', system-ui, sans-serif";
    const cleanName = name.trim() || "Your Name";

    /* 1. Background — deep navy diagonal gradient + faint dot grid */
    const bg = ctx.createLinearGradient(0, 0, SIZE, SIZE);
    bg.addColorStop(0, "#17296f");
    bg.addColorStop(0.5, NAVY);
    bg.addColorStop(1, NAVY_DEEP);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, SIZE, SIZE);

    ctx.fillStyle = "rgba(255,255,255,0.045)";
    for (let gy = 26; gy < SIZE; gy += 44) {
      for (let gx = 26; gx < SIZE; gx += 44) {
        ctx.beginPath();
        ctx.arc(gx, gy, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    /* 2. Header — official IEPS logo on a white plate (its navy lettering
          would vanish on the navy background), sponsor slot top-right */
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    setLetterSpacing(ctx, "0px");

    if (logo) {
      const logoW = 300;
      const logoH = logoW * (logo.height / logo.width);
      const pad = 16;
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.25)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 6;
      roundRect(ctx, 56, 48, logoW + pad * 2, logoH + pad * 2, 18);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.restore();
      ctx.drawImage(logo, 56 + pad, 48 + pad, logoW, logoH);
    } else {
      // Fallback wordmark while the logo loads
      ctx.font = `800 66px ${body}`;
      ctx.fillStyle = "#ffffff";
      ctx.fillText("IEPS", 64, 108);
      const wMark = ctx.measureText("IEPS").width;
      ctx.font = `700 40px ${body}`;
      ctx.fillStyle = GOLD;
      ctx.fillText("3.0", 64 + wMark + 14, 108);
    }

    // Sponsor slot — real sponsor logo on a white plate (same treatment as
    // the IEPS mark, since a sponsor's own colours may not read on navy),
    // falling back to a dashed placeholder while the asset loads.
    const slotX = 772, slotY = 58, slotW = 244, slotH = 86;
    if (sponsorLogo) {
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.25)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 6;
      roundRect(ctx, slotX, slotY, slotW, slotH, 14);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.restore();

      // Fit the logo inside the plate (contain), centred, with padding.
      const pad = 14;
      const maxW = slotW - pad * 2;
      const maxH = slotH - pad * 2;
      const scale = Math.min(maxW / sponsorLogo.width, maxH / sponsorLogo.height);
      const w = sponsorLogo.width * scale;
      const h = sponsorLogo.height * scale;
      ctx.drawImage(
        sponsorLogo,
        slotX + (slotW - w) / 2,
        slotY + (slotH - h) / 2,
        w,
        h
      );
    } else {
      ctx.save();
      ctx.setLineDash([9, 9]);
      ctx.strokeStyle = "rgba(255,255,255,0.30)";
      ctx.lineWidth = 2;
      roundRect(ctx, slotX, slotY, slotW, slotH, 14);
      ctx.stroke();
      ctx.restore();
      ctx.textAlign = "center";
      setLetterSpacing(ctx, "4px");
      ctx.font = `600 17px ${body}`;
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.fillText("SPONSOR", 894, 96);
      ctx.fillText("LOGO", 894, 122);
      setLetterSpacing(ctx, "0px");
    }

    /* 3. Photo — gold ring with brand blobs */
    const cx = 300;
    const cy = 452;
    const r = 182;

    blob(ctx, 128, 268, 116, -18, GOLD); // gold blob, top-left
    // gold ring
    ctx.beginPath();
    ctx.arc(cx, cy, r + 14, 0, Math.PI * 2);
    ctx.fillStyle = GOLD;
    ctx.fill();
    // photo (or initials fallback), clipped to circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    if (photo) {
      drawCover(ctx, photo, cx, cy, r);
    } else {
      const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
      g.addColorStop(0, NAVY_LIGHT);
      g.addColorStop(1, NAVY_DEEP);
      ctx.fillStyle = g;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `800 150px ${body}`;
      ctx.fillText(initials(name), cx, cy + 4);
      ctx.textBaseline = "alphabetic";
    }
    ctx.restore();
    blob(ctx, cx + r - 24, cy + r - 42, 84, 16, GREEN); // green blob, bottom-right

    /* 4. Name — gold pill under the photo */
    const pillCy = 748;
    let nameSize = 44;
    ctx.font = `700 ${nameSize}px ${body}`;
    const maxNameW = 380;
    while (ctx.measureText(cleanName).width > maxNameW && nameSize > 22) {
      nameSize -= 2;
      ctx.font = `700 ${nameSize}px ${body}`;
    }
    const nameW = ctx.measureText(cleanName).width;
    const pillW = Math.max(nameW + 120, 330);
    const pillH = 88;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 12;
    roundRect(ctx, cx - pillW / 2, pillCy - pillH / 2, pillW, pillH, pillH / 2);
    ctx.fillStyle = GOLD;
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = NAVY;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(cleanName, cx, pillCy + 2);
    ctx.textBaseline = "alphabetic";

    /* 5. Headline — right column (centre chosen so nothing reaches the
          photo circle at x≈496 or the canvas edge) */
    const rx = 778;
    ctx.textAlign = "center";
    ctx.font = `800 96px ${body}`;
    ctx.fillStyle = "#ffffff";
    ctx.fillText("I will be", rx, 336);
    ctx.fillStyle = GOLD;
    ctx.fillText("attending", rx, 440);

    // green underline rule, centred under the headline
    roundRect(ctx, rx - 75, 472, 150, 9, 5);
    ctx.fillStyle = GREEN;
    ctx.fill();

    // subtitle — wrapped to two short lines so it clears the photo circle
    ctx.fillStyle = "#ffffff";
    const subSize = 30;
    ctx.font = `400 ${subSize}px ${body}`;
    const wThe = ctx.measureText("the ").width;
    const line1Bold = "Ife Education Parliamentary";
    ctx.font = `700 ${subSize}px ${body}`;
    const wBold = ctx.measureText(line1Bold).width;
    const line1Start = rx - (wThe + wBold) / 2;
    ctx.textAlign = "left";
    ctx.font = `400 ${subSize}px ${body}`;
    ctx.fillText("the ", line1Start, 534);
    ctx.font = `700 ${subSize}px ${body}`;
    ctx.fillText(line1Bold, line1Start + wThe, 534);
    ctx.textAlign = "center";
    ctx.fillText("Summit 3.0", rx, 576);

    /* 6. Details — navy chips with gold icons */
    const rows: [
      (c: CanvasRenderingContext2D, x: number, y: number) => void,
      () => void,
    ][] = [];
    const chipX = 506;
    const textX = chipX + 84;
    const dateMatch = EVENT.dateLabel.match(/^(.*?)(\d{4})\s*$/);
    const datePrefix = dateMatch ? dateMatch[1] : EVENT.dateLabel;
    const dateYear = dateMatch ? dateMatch[2] : "";

    rows.push([
      iconCalendar,
      () => {
        ctx.font = `600 31px ${body}`;
        ctx.fillStyle = "#ffffff";
        const wPrefix = ctx.measureText(datePrefix).width;
        ctx.fillText(datePrefix, textX, 0);
        if (dateYear) {
          ctx.fillStyle = GOLD;
          ctx.fillText(dateYear, textX + wPrefix, 0);
        }
      },
    ]);
    rows.push([
      iconPin,
      () => {
        ctx.font = `600 31px ${body}`;
        ctx.fillStyle = "#ffffff";
        ctx.fillText(`${EVENT.venue.shortName} · ${EVENT.venue.city}`, textX, 0);
      },
    ]);
    rows.push([
      iconClock,
      () => {
        ctx.font = `600 31px ${body}`;
        ctx.fillStyle = "#ffffff";
        ctx.fillText(EVENT.timeLabel, textX, 0);
      },
    ]);

    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    rows.forEach(([icon, text], i) => {
      const y = 668 + i * 86;
      roundRect(ctx, chipX, y - 30, 60, 60, 18);
      ctx.fillStyle = "rgba(26,45,138,0.85)";
      ctx.fill();
      icon(ctx, chipX + 30, y);
      ctx.save();
      ctx.translate(0, y);
      text();
      ctx.restore();
    });
    ctx.textBaseline = "alphabetic";

    /* 7. Partners band — dashed slots until partner logos are supplied */
    const bandY = 924;
    const bandH = 92;
    ctx.fillStyle = "rgba(6,11,51,0.55)";
    ctx.fillRect(0, bandY, SIZE, bandH);
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    setLetterSpacing(ctx, "4px");
    ctx.font = `700 18px ${body}`;
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillText("PARTNERS", 56, bandY + bandH / 2);
    setLetterSpacing(ctx, "0px");
    for (let i = 0; i < 4; i++) {
      const slotX = 224 + i * 210, slotY = bandY + 20, slotW = 186, slotH = 52;
      // First slot holds our one confirmed partner logo; the rest stay
      // dashed placeholders until more partners are added.
      if (i === 0 && sponsorLogo) {
        roundRect(ctx, slotX, slotY, slotW, slotH, 12);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        const pad = 8;
        const maxW = slotW - pad * 2;
        const maxH = slotH - pad * 2;
        const scale = Math.min(maxW / sponsorLogo.width, maxH / sponsorLogo.height);
        const w = sponsorLogo.width * scale;
        const h = sponsorLogo.height * scale;
        ctx.drawImage(sponsorLogo, slotX + (slotW - w) / 2, slotY + (slotH - h) / 2, w, h);
      } else {
        ctx.save();
        ctx.setLineDash([8, 8]);
        ctx.strokeStyle = "rgba(255,255,255,0.22)";
        ctx.lineWidth = 2;
        roundRect(ctx, slotX, slotY, slotW, slotH, 12);
        ctx.stroke();
        ctx.restore();
      }
    }
    ctx.textBaseline = "alphabetic";

    /* 8. Gold base bar — brand anchor (no website text by design) */
    ctx.fillStyle = GOLD;
    ctx.fillRect(0, SIZE - 12, SIZE, 12);
  }, [name, photo, logo, sponsorLogo]);

  useEffect(() => {
    draw();
  }, [draw, fontsReady]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset so picking the same file again re-triggers onChange.
    e.target.value = "";
    if (!file) return;
    setPhotoError(null);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => setPhoto(img);
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setPhotoError(
        "That photo couldn't be read. Your browser may not support the format (e.g. HEIC). Please try a JPG or PNG."
      );
    };
    img.src = url;
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safe =
        (name.trim() || "ieps-3.0").toLowerCase().replace(/[^a-z0-9]+/g, "-") +
        "-i-will-be-attending.png";
      a.download = safe;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  return (
    <div className="rounded-3xl border border-navy/10 bg-white p-6 text-left shadow-card sm:p-8">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl font-bold text-navy">
          Share that you&apos;re attending
        </h2>
        <p className="text-sm text-ink/60">
          Add a photo (optional) and download your personalised{" "}
          <span className="font-semibold text-green">
            &ldquo;I will be attending&rdquo;
          </span>{" "}
          graphic. Your photo stays on your device.
        </p>
      </div>

      {/* Live preview */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-navy/10 bg-offwhite">
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          className="block h-auto w-full"
          aria-label="Preview of your I will be attending IEPS 3.0 graphic"
          role="img"
        />
      </div>

      {/* Name field */}
      <label className="mt-5 block text-sm font-medium text-ink/80" htmlFor="badge-name">
        Name on the graphic
      </label>
      <input
        id="badge-name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        maxLength={60}
        className="mt-1.5 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-ink outline-none transition-colors focus:border-green focus:ring-2 focus:ring-green/30"
      />

      {/* Controls */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <label className="btn-ripple inline-flex min-h-[48px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-green/30 px-6 font-display font-semibold text-green transition-colors hover:bg-green/5">
          <Upload className="h-5 w-5" />
          {photo ? "Change photo" : "Upload photo"}
          <input
            type="file"
            accept="image/*"
            onChange={onFile}
            className="sr-only"
          />
        </label>
        {photo && (
          <button
            type="button"
            onClick={() => setPhoto(null)}
            className="btn-ripple inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border-2 border-navy/15 px-5 font-display font-semibold text-ink/70 transition-colors hover:bg-navy/5"
          >
            <ImageOff className="h-5 w-5" />
            Remove
          </button>
        )}
        <button
          type="button"
          onClick={download}
          className="btn-ripple inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-full bg-green px-6 font-display font-semibold text-white shadow-gold transition-colors hover:bg-green-light"
        >
          <Download className="h-5 w-5" />
          Download graphic
        </button>
      </div>

      {photoError && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600" role="alert">
          {photoError}
        </p>
      )}

      <p className="mt-3 flex items-center gap-1.5 text-xs text-ink/45">
        <RefreshCw className="h-3.5 w-3.5" />
        The preview updates as you type or change your photo.
      </p>
    </div>
  );
}
