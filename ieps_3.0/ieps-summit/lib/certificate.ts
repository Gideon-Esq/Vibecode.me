import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { EVENT, CERTIFICATE_SIGNATORIES } from "@/lib/constants";

/* ── Brand palette (chamber navy & parliamentary gold) ───────── */
const INK = "#0D1B5E"; // deep navy — title & name
const NAVY_DEEP = "#080F3A"; // near-black navy — rules, gavel
const BODY = "#4A5568"; // muted blue-grey — paragraphs
const MUTED = "#8A93A3"; // light grey-blue — captions
const GOLD = "#F5C400"; // brass gold — seal, plate
const GOLD_LIGHT = "#FFD740"; // pale gold — seal highlight
const GOLD_DEEP = "#C49B00"; // deep gold — seal shading, tagline

/* A4 landscape (points) */
const W = 841.89;
const H = 595.28;

/** Centred text helper. */
function centered(
  doc: PDFKit.PDFDocument,
  text: string,
  y: number,
  options: PDFKit.Mixins.TextOptions & { fontSize?: number; color?: string } = {}
) {
  const { fontSize, color, ...textOptions } = options;
  if (fontSize) doc.fontSize(fontSize);
  if (color) doc.fillColor(color);
  doc.text(text, 0, y, { width: W, align: "center", ...textOptions });
}

/** Pick the largest font size that keeps `text` within `maxWidth`. */
function fitFontSize(
  doc: PDFKit.PDFDocument,
  text: string,
  font: string,
  start: number,
  min: number,
  maxWidth: number
): number {
  doc.font(font);
  let size = start;
  while (size > min) {
    doc.fontSize(size);
    if (doc.widthOfString(text) <= maxWidth) break;
    size -= 2;
  }
  return size;
}

/** A horizontal rule with a small filled gold tick at each end. */
function tickedRule(
  doc: PDFKit.PDFDocument,
  x1: number,
  x2: number,
  y: number
) {
  doc.save();
  doc.lineWidth(0.9).strokeColor(INK).moveTo(x1, y).lineTo(x2, y).stroke();
  doc.restore();
  for (const x of [x1, x2]) {
    doc.save();
    doc.rect(x - 3, y - 3, 6, 6).lineWidth(1).stroke(GOLD_DEEP);
    doc.circle(x, y, 1.1).fill(GOLD_DEEP);
    doc.restore();
  }
}

/** Resolves a `/public`-relative path to an absolute file path, if it exists. */
function publicFile(relPath: string): string | null {
  const abs = path.join(process.cwd(), "public", relPath);
  return fs.existsSync(abs) ? abs : null;
}

/**
 * Like `publicFile`, but only returns the path when the file is an image
 * format PDFKit can actually embed (PNG or JPEG), verified by magic bytes —
 * not by extension. A mislabelled asset (e.g. a WebP saved as `.png`) would
 * otherwise throw "Unknown image format" and break the whole certificate, so
 * this returns null instead and lets callers fall back gracefully.
 */
function supportedImageFile(relPath: string): string | null {
  const abs = publicFile(relPath);
  if (!abs) return null;
  try {
    const head = Buffer.alloc(4);
    const fd = fs.openSync(abs, "r");
    try {
      fs.readSync(fd, head, 0, 4, 0);
    } finally {
      fs.closeSync(fd);
    }
    const isPng = head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47;
    const isJpeg = head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
    if (isPng || isJpeg) return abs;
    console.warn(`[certificate] ignoring unsupported image (not PNG/JPEG): ${relPath}`);
    return null;
  } catch {
    return null;
  }
}

/** Draws a real logo PNG from /public/logos, centred in a size×size box. */
function drawLogoImage(
  doc: PDFKit.PDFDocument,
  file: string,
  x: number,
  y: number,
  size: number
) {
  const abs = supportedImageFile(`logos/${file}`);
  if (abs) {
    doc.image(abs, x, y, { fit: [size, size], align: "center", valign: "center" });
  }
}

/** Header row: convening body (left), IEPS mark (right). */
function drawHeader(doc: PDFKit.PDFDocument) {
  // Left — convening body: ESRC + OAU crests, set side by side (a small gap,
  // no overlap, so neither crest reads as clipped/disrupted).
  const lx = 56;
  drawLogoImage(doc, "esrc.png", lx, 38, 40);
  drawLogoImage(doc, "oau.png", lx + 46, 38, 40);
  const lTextX = lx + 96;
  doc
    .font("Helvetica-Bold")
    .fontSize(10.5)
    .fillColor(INK)
    .text("EDUCATION STUDENTS'", lTextX, 40, { characterSpacing: 0.4 })
    .text("REPRESENTATIVE COUNCIL", lTextX, 53, { characterSpacing: 0.4 });
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(MUTED)
    .text("Obafemi Awolowo University, Ile-Ife", lTextX, 68);

  // Right — IEPS 3.0 mark (falls back to a drawn wordmark if the asset is ever
  // missing, so generation never breaks).
  const rx = W - 56;
  const rightLogoAbs = supportedImageFile("logos/ieps.png");
  if (rightLogoAbs) {
    const logoW = 140;
    const logoH = logoW * (81 / 416); // preserve the mark's aspect ratio
    doc.image(rightLogoAbs, rx - logoW, 40, { width: logoW, height: logoH });
  } else {
    doc
      .font("Times-Bold")
      .fontSize(18)
      .fillColor(INK)
      .text("IEPS 3.0", rx - 140, 48, { width: 140, align: "right" });
  }
}

/** A short decorative scribble standing in for a hand signature (fallback). */
function drawSignatureScribble(
  doc: PDFKit.PDFDocument,
  cx: number,
  baseY: number
) {
  doc.save();
  doc
    .lineWidth(1)
    .strokeColor(INK)
    .moveTo(cx - 55, baseY)
    .bezierCurveTo(cx - 40, baseY - 16, cx - 30, baseY + 10, cx - 16, baseY - 4)
    .bezierCurveTo(cx - 6, baseY - 14, cx, baseY + 6, cx + 12, baseY - 8)
    .bezierCurveTo(cx + 22, baseY - 16, cx + 32, baseY - 2, cx + 48, baseY - 10)
    .stroke();
  doc.restore();
}

/**
 * Draws a signer's scanned signature above the rule when the PNG exists at
 * /public<signaturePath>; otherwise falls back to a decorative scribble.
 */
function drawSignature(
  doc: PDFKit.PDFDocument,
  cx: number,
  ruleY: number,
  signaturePath: string
) {
  const abs = supportedImageFile(signaturePath.replace(/^\//, ""));
  if (abs) {
    const boxW = 130;
    const boxH = 42;
    doc.image(abs, cx - boxW / 2, ruleY - boxH - 2, {
      fit: [boxW, boxH],
      align: "center",
      valign: "bottom",
    });
  } else {
    drawSignatureScribble(doc, cx, ruleY - 12);
  }
}

/** One signer's name + role, centred under the shared rule. */
function signatureCaption(
  doc: PDFKit.PDFDocument,
  centerX: number,
  y: number,
  name: string,
  role: string
) {
  const half = 105;
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor(INK)
    .text(name, centerX - half, y, { width: half * 2, align: "center" });
  doc
    .font("Helvetica")
    .fontSize(8.5)
    .fillColor(MUTED)
    .text(role, centerX - half, y + 15, {
      width: half * 2,
      align: "center",
      characterSpacing: 0.4,
    });
}

/** Wax-seal medallion — a scalloped gold disc sitting on the signature rule. */
function drawWaxSeal(doc: PDFKit.PDFDocument, cx: number, cy: number) {
  const r = 26;
  const bumps = 22;
  const pts: [number, number][] = [];
  for (let i = 0; i < bumps; i++) {
    const a = (i / bumps) * Math.PI * 2;
    const rr = r + (i % 2 === 0 ? 2.2 : 0);
    pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
  }
  doc.save();
  doc.polygon(...pts).fill(GOLD_DEEP);
  doc.circle(cx, cy, r - 4).fill(GOLD);
  doc.circle(cx - 5, cy - 6, r - 14).fillOpacity(0.55).fill(GOLD_LIGHT);
  doc.restore();
  doc.save();
  doc.circle(cx, cy, r - 4).lineWidth(0.6).stroke(NAVY_DEEP);
  doc.restore();

  const step = Math.PI / 5;
  const star: [number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? 8 : 3.4;
    const a = i * step - Math.PI / 2;
    star.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
  }
  doc.save();
  doc.polygon(...star).fill(NAVY_DEEP);
  doc.restore();
}

/**
 * Layered wavy ribbon flourish anchored to a bottom corner. `mirror` flips
 * it to the opposite corner.
 */
function drawCornerWaves(doc: PDFKit.PDFDocument, mirror: boolean) {
  const m = (x: number, y: number): [number, number] => (mirror ? [W - x, y] : [x, y]);
  const bands: { color: string; opacity: number; d: [number, number][] }[] = [
    {
      color: INK,
      opacity: 0.08,
      d: [
        m(0, H), m(0, H - 210),
        m(90, H - 170), m(190, H - 60),
        m(230, H), m(0, H),
      ],
    },
    {
      color: INK,
      opacity: 0.16,
      d: [
        m(0, H), m(0, H - 150),
        m(70, H - 118), m(150, H - 35),
        m(175, H), m(0, H),
      ],
    },
    {
      color: GOLD_DEEP,
      opacity: 0.5,
      d: [
        m(0, H), m(0, H - 96),
        m(42, H - 72), m(96, H - 18),
        m(112, H), m(0, H),
      ],
    },
  ];

  for (const band of bands) {
    doc.save();
    doc.fillOpacity(band.opacity);
    const pts = band.d;
    doc
      .moveTo(pts[0][0], pts[0][1])
      .lineTo(pts[1][0], pts[1][1])
      .bezierCurveTo(
        pts[2][0], pts[2][1],
        pts[2][0], pts[2][1],
        pts[3][0], pts[3][1]
      )
      .lineTo(pts[4][0], pts[4][1])
      .closePath()
      .fill(band.color);
    doc.restore();
  }
}

/**
 * Generates a formal Certificate of Participation PDF: a three-part navy/gold
 * header, a ticked-rule title block, a line-by-line citation, and a wax-seal
 * signature row — echoing a real chamber's order paper. Deterministic: same
 * name + id always produce the same document, so the public stream endpoint
 * can regenerate it on demand.
 */
export function generateCertificate(
  name: string,
  registrationId: string
): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        // A4 + landscape => 841.89 x 595.28 (W x H). Do NOT also pass an explicit
        // size array, or PDFKit swaps the dimensions back to portrait.
        size: "A4",
        layout: "landscape",
        margin: 0,
        info: {
          Title: `IEPS 3.0 Certificate — ${name}`,
          Author: "Education Students' Representative Council, OAU",
          Subject: "Certificate of Participation",
        },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      doc.rect(0, 0, W, H).fill("#FFFFFF");
      drawCornerWaves(doc, false);
      drawCornerWaves(doc, true);

      drawHeader(doc);
      tickedRule(doc, 64, W - 64, 100);

      /* Title */
      const title = "CERTIFICATE OF PARTICIPATION";
      const titleSize = fitFontSize(doc, title, "Helvetica-Bold", 38, 26, W - 160);
      doc.font("Helvetica-Bold");
      centered(doc, title, 130, { fontSize: titleSize, color: INK, characterSpacing: 1 });

      doc.font("Helvetica");
      centered(doc, "This certificate is hereby awarded to", 182, {
        fontSize: 11.5,
        color: MUTED,
      });

      /* Attendee name — bold, auto-fit, with a short rule beneath */
      const cleanName = name.trim() || "Participant";
      const nameSize = fitFontSize(doc, cleanName, "Helvetica-Bold", 30, 18, W - 280);
      doc.font("Helvetica-Bold");
      centered(doc, cleanName, 206, { fontSize: nameSize, color: INK });
      const nameW = Math.min(doc.widthOfString(cleanName) + 100, 420);
      const ruleY = 206 + nameSize + 14;
      tickedRule(doc, W / 2 - nameW / 2, W / 2 + nameW / 2, ruleY);

      /* Citation — short centred lines, mirroring an order-paper reading */
      let y = ruleY + 26;
      const line = (
        text: string,
        opts: { font?: string; size?: number; color?: string; width?: number; italic?: boolean } = {}
      ) => {
        doc.font(opts.font ?? "Helvetica");
        centered(doc, text, y, {
          fontSize: opts.size ?? 10.5,
          color: opts.color ?? BODY,
          width: opts.width,
        });
      };

      line("In recognition of your distinguished participation as a delegate at the");
      y += 19;
      line(`${EVENT.fullName} ${EVENT.edition}`, { font: "Helvetica-Bold", color: INK, size: 11 });
      y += 17;
      line("themed", { size: 9.5 });
      y += 16;
      doc.font("Helvetica-BoldOblique").fontSize(10.5).fillColor(INK);
      const themeText = `“${EVENT.theme}”`;
      const themeWidth = 620;
      const themeHeight = doc.heightOfString(themeText, { width: themeWidth, lineGap: 3 });
      doc.text(themeText, (W - themeWidth) / 2, y, {
        width: themeWidth,
        align: "center",
        lineGap: 3,
      });
      y += themeHeight + 18;
      line("Held at", { size: 9.5 });
      y += 16;
      line(`${EVENT.venue.name}, ${EVENT.venue.institution}`, { font: "Helvetica-Bold", color: INK, size: 10.5 });
      y += 16;
      line(`${EVENT.venue.city}, ${EVENT.venue.state} · ${EVENT.dateLabel}`, {
        font: "Helvetica-Bold",
        color: INK,
        size: 10.5,
      });
      y += 24;
      doc.font("Helvetica").fontSize(10).fillColor(BODY);
      const closingText =
        "Your active engagement in parliamentary discourse and commitment to nation " +
        "building and educational reform are commendable.";
      const closingWidth = 560;
      const closingHeight = doc.heightOfString(closingText, { width: closingWidth, lineGap: 3 });
      doc.text(closingText, (W - closingWidth) / 2, y, {
        width: closingWidth,
        align: "center",
        lineGap: 3,
      });

      /* Signature row — pinned below the citation with a fixed minimum gap
         so it never collides with a long theme/closing statement. The
         signature image itself is drawn ~44pt above this rule, so the gap
         from the closing text needs to clear that, not just the rule line. */
      const sigRuleY = Math.max(486, y + closingHeight + 46);
      const [signerA, signerB] = CERTIFICATE_SIGNATORIES;
      tickedRule(doc, 64, W - 64, sigRuleY);
      drawSignature(doc, 250, sigRuleY, signerA.signature);
      drawSignature(doc, W - 250, sigRuleY, signerB.signature);
      drawWaxSeal(doc, W / 2, sigRuleY);
      signatureCaption(doc, 250, sigRuleY + 14, signerA.name, signerA.role);
      signatureCaption(doc, W - 250, sigRuleY + 14, signerB.name, signerB.role);

      /* Verification id (bottom-centre) */
      doc
        .font("Helvetica")
        .fontSize(7)
        .fillColor(MUTED)
        .text(`Verification ID: ${registrationId}`, 0, H - 26, {
          width: W,
          align: "center",
        });

      doc.end();
    } catch (err) {
      reject(err instanceof Error ? err : new Error("Certificate generation failed"));
    }
  });
}

export function certificateFilename(registrationId: string): string {
  return `IEPS-3.0-Certificate-${registrationId}.pdf`;
}
