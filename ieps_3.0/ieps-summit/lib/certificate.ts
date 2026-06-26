import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { EVENT, CONTACT } from "@/lib/constants";

/* Brand palette */
const NAVY = "#0D1B5E";
const GOLD = "#F5C400";
const GREEN = "#1A7A3C";
const WHITE = "#FFFFFF";

/* A4 landscape (points) */
const W = 841.89;
const H = 595.28;

/** Organiser logos embedded into the certificate (abbr used for fallback box). */
const LOGOS = [
  { file: "oau.png", abbr: "OAU" },
  { file: "esrc.png", abbr: "ESRC" },
  { file: "esan.png", abbr: "ESAN" },
];

/** Centered text helper — draws across the full page width at a fixed Y. */
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

/** Pick a font size for the name so it always fits within `maxWidth`. */
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

function drawLogos(doc: PDFKit.PDFDocument, y: number) {
  const boxW = 64;
  const boxH = 64;
  const gap = 40;
  const totalW = LOGOS.length * boxW + (LOGOS.length - 1) * gap;
  let x = (W - totalW) / 2;

  for (const logo of LOGOS) {
    const logoPath = path.join(process.cwd(), "public", "logos", logo.file);
    let embedded = false;
    try {
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, x, y, {
          fit: [boxW, boxH],
          align: "center",
          valign: "center",
        });
        embedded = true;
      }
    } catch {
      embedded = false;
    }

    if (!embedded) {
      // Placeholder rectangle with the organisation abbreviation.
      doc
        .save()
        .lineWidth(1)
        .roundedRect(x, y, boxW, boxH, 8)
        .stroke(GOLD)
        .fillColor(GOLD)
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(logo.abbr, x, y + boxH / 2 - 6, { width: boxW, align: "center" })
        .restore();
    }

    x += boxW + gap;
  }
}

function drawSeal(doc: PDFKit.PDFDocument, cx: number, cy: number) {
  const r = 46;
  doc.save();
  doc.lineWidth(2).circle(cx, cy, r).stroke(GOLD);
  doc.lineWidth(0.75).circle(cx, cy, r - 6).stroke(GOLD);

  // Top arc label and bottom label, kept simple with centered straight text.
  doc
    .fillColor(GOLD)
    .font("Helvetica-Bold")
    .fontSize(15)
    .text("IEPS", cx - r, cy - 16, { width: r * 2, align: "center" });
  doc
    .fontSize(11)
    .text("3.0", cx - r, cy + 2, { width: r * 2, align: "center" });
  doc
    .font("Helvetica")
    .fontSize(6)
    .fillColor(GOLD)
    .text("OFFICIAL  SEAL", cx - r, cy + 18, {
      width: r * 2,
      align: "center",
      characterSpacing: 1,
    });
  doc.restore();
}

/**
 * Generates a premium landscape-A4 Certificate of Participation PDF.
 * Deterministic: the same name + id always produce the same document, so the
 * public stream endpoint can regenerate it on demand.
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

      /* Background full bleed */
      doc.rect(0, 0, W, H).fill(NAVY);

      /* Double gold border frame */
      doc.lineWidth(3).strokeColor(GOLD).rect(18, 18, W - 36, H - 36).stroke();
      doc.lineWidth(1).strokeColor(GOLD).rect(27, 27, W - 54, H - 54).stroke();

      /* Title */
      doc.font("Helvetica-Bold");
      centered(doc, "CERTIFICATE OF PARTICIPATION", 56, {
        fontSize: 24,
        color: GOLD,
        characterSpacing: 6,
      });

      /* Logos */
      drawLogos(doc, 96);

      /* Divider */
      doc
        .lineWidth(1)
        .strokeColor(GOLD)
        .moveTo(W / 2 - 150, 182)
        .lineTo(W / 2 + 150, 182)
        .stroke();

      /* "This is to certify that" */
      doc.font("Helvetica-Oblique");
      centered(doc, "This is to certify that", 200, {
        fontSize: 15,
        color: WHITE,
      });

      /* Attendee name (auto-fit) */
      const cleanName = name.trim() || "Participant";
      const nameSize = fitFontSize(
        doc,
        cleanName,
        "Helvetica-Bold",
        42,
        22,
        W - 200
      );
      doc.font("Helvetica-Bold");
      centered(doc, cleanName, 224, { fontSize: nameSize, color: GOLD });

      /* "participated in the" */
      doc.font("Helvetica");
      centered(doc, "participated in the", 224 + nameSize + 14, {
        fontSize: 14,
        color: WHITE,
      });

      /* Summit name (green) */
      doc.font("Helvetica-Bold");
      centered(doc, "IFE EDUCATION PARLIAMENTARY SUMMIT 3.0", 322, {
        fontSize: 22,
        color: GREEN,
        characterSpacing: 1,
      });

      /* Date + venue */
      doc.font("Helvetica");
      centered(
        doc,
        `on ${EVENT.dateLabel} at the ${EVENT.venue.name},`,
        360,
        { fontSize: 12.5, color: WHITE }
      );
      centered(
        doc,
        `${EVENT.venue.institution}, ${EVENT.venue.city}, ${EVENT.venue.state}.`,
        378,
        { fontSize: 12.5, color: WHITE }
      );

      /* Theme */
      doc.font("Helvetica-Oblique");
      centered(doc, `Theme: ${EVENT.theme}`, 408, {
        fontSize: 9.5,
        color: GOLD,
        width: W,
      });

      /* Signature block (bottom-left) */
      const sigX = 96;
      const sigY = 500;
      doc
        .lineWidth(1)
        .strokeColor(WHITE)
        .moveTo(sigX, sigY)
        .lineTo(sigX + 190, sigY)
        .stroke();
      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor(WHITE)
        .text(CONTACT.name, sigX, sigY + 6, { width: 190, align: "center" });
      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(GOLD)
        .text("Convener, IEPS 3.0", sigX, sigY + 22, {
          width: 190,
          align: "center",
        });

      /* Seal (bottom-right) */
      drawSeal(doc, W - 150, sigY + 4);

      /* Bottom-center organisers */
      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(WHITE)
        .text(
          "Education Students' Representative Council, OAU  |  ESAN",
          0,
          H - 56,
          { width: W, align: "center", characterSpacing: 0.5 }
        );

      /* Tiny verification id */
      doc
        .font("Helvetica")
        .fontSize(6)
        .fillColor("#9aa0c8")
        .text(`Verification ID: ${registrationId}`, 0, H - 40, {
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
