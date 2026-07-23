import nodemailer, { type Transporter } from "nodemailer";
import fs from "fs";
import path from "path";
import { EVENT, CONTACT, ORGANIZERS, SOCIALS } from "@/lib/constants";
import { DELEGATE_WHATSAPP_GROUP_URL } from "@/lib/share";

/* ────────────────────────────────────────────────────────────
 * Brand logo — embedded as an inline CID attachment so it renders
 * even in clients that block remote images.
 * ──────────────────────────────────────────────────────────── */

const LOGO_CID = "ieps-logo@ieps-summit";
const LOGO_PATH = path.join(process.cwd(), "public", "logos", "ieps.png");
const HAS_LOGO = fs.existsSync(LOGO_PATH);

/** Inline logo attachment for sendMail; empty when the asset is missing. */
function logoAttachments() {
  return HAS_LOGO
    ? [
        {
          filename: "ieps-logo.png",
          path: LOGO_PATH,
          cid: LOGO_CID,
          contentDisposition: "inline" as const,
        },
      ]
    : [];
}

/**
 * Shared navy header. The logo's navy lettering would vanish on the navy
 * band, so it sits on a white plate (same treatment as the site footer).
 * Falls back to the old text wordmark if the PNG is ever missing.
 */
function emailHeaderHtml(navy: string, gold: string): string {
  const mark = HAS_LOGO
    ? `<span style="display:inline-block;background-color:#ffffff;padding:10px 18px;border-radius:12px;line-height:0;"><img src="cid:${LOGO_CID}" alt="IEPS 3.0 | Ife Education Parliamentary Summit" width="190" style="display:block;width:190px;max-width:100%;height:auto;border:0;" /></span>`
    : `<span style="font-size:30px;font-weight:bold;color:#ffffff;letter-spacing:-0.5px;">IEPS</span><span style="display:inline-block;background-color:${gold};color:${navy};font-size:15px;font-weight:bold;padding:3px 12px;border-radius:999px;margin-left:6px;vertical-align:middle;">3.0</span>`;
  return `${mark}
              <div style="margin-top:10px;font-size:11px;letter-spacing:3px;color:${gold};text-transform:uppercase;">Ife Education Parliamentary Summit</div>`;
}

/**
 * Shared navy footer — contact name/role + email only (no phone), with the
 * convening bodies. OAU is the host institution, not an organiser, so it is
 * omitted from the "Organised by" line.
 */
function emailFooterHtml(navy: string, gold: string): string {
  const organisers = ORGANIZERS.filter((o) => o.abbr !== "OAU")
    .map((o) => o.abbr)
    .join(" &middot; ");
  return `<tr>
            <td style="background-color:${navy};padding:30px 40px;text-align:center;">
              <p style="margin:0 0 3px;color:#ffffff;font-size:14px;font-weight:bold;">${CONTACT.name}</p>
              <p style="margin:0 0 14px;color:rgba(255,255,255,0.55);font-size:11px;text-transform:uppercase;letter-spacing:2px;">${CONTACT.role}</p>
              <p style="margin:0 0 16px;">
                <a href="mailto:${SOCIALS.email}" style="color:${gold};text-decoration:none;font-size:13px;">${SOCIALS.email}</a>
              </p>
              <p style="margin:0;color:rgba(255,255,255,0.45);font-size:11px;letter-spacing:0.5px;">Organised by ${organisers}</p>
            </td>
          </tr>
          <tr><td style="height:5px;background-color:${gold};font-size:0;line-height:0;">&nbsp;</td></tr>`;
}

/**
 * Lazily-built Nodemailer SMTP transport. Configure via env:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE (optional), EMAIL_FROM
 * Returns null when SMTP isn't configured so callers can degrade gracefully.
 */
let transporter: Transporter | null | undefined;

function getTransporter(): Transporter | null {
  if (transporter !== undefined) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    transporter = null;
    return null;
  }

  const port = Number(process.env.SMTP_PORT ?? 465);
  // Default to implicit TLS on 465; STARTTLS otherwise.
  const secure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === "true"
    : port === 465;

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
  return transporter;
}

/** Sender address. Defaults to the SMTP user when EMAIL_FROM is unset. */
const FROM =
  process.env.EMAIL_FROM ??
  (process.env.SMTP_USER
    ? `IEPS 3.0 <${process.env.SMTP_USER}>`
    : "IEPS 3.0 <no-reply@ieps.local>");

export const CONFIRMATION_SUBJECT =
  "Registration Confirmed: IEPS 3.0 | 22nd July 2026";

type ConfirmationData = {
  fullName: string;
  email: string;
};

/* ────────────────────────────────────────────────────────────
 * HTML template (table-based + inline styles for email clients)
 * ──────────────────────────────────────────────────────────── */

export function confirmationEmailHtml({ fullName }: ConfirmationData): string {
  const navy = "#0D1B5E";
  const gold = "#F5C400";
  const green = "#017E33"; // brand green — logo SUMMIT mark
  const firstName = fullName.split(" ")[0] || fullName;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light only" />
  <title>${CONFIRMATION_SUBJECT}</title>
</head>
<body style="margin:0;padding:0;background-color:#eef1f8;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">You're confirmed for IEPS 3.0:  at ${EVENT.venue.shortName}.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef1f8;padding:36px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="620" cellpadding="0" cellspacing="0" style="width:620px;max-width:100%;background-color:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e2e6f1;box-shadow:0 12px 36px rgba(13,27,94,0.10);">

          <!-- Navy header with logo -->
          <tr>
            <td style="background-color:${navy};padding:36px 40px 30px;text-align:center;">
              ${emailHeaderHtml(navy, gold)}
            </td>
          </tr>
          <!-- gold hairline -->
          <tr><td style="height:3px;background-color:${gold};font-size:0;line-height:0;">&nbsp;</td></tr>

          <!-- Body -->
          <tr>
            <td style="padding:44px 44px 36px;">
              <div style="text-align:center;">
                <span style="display:inline-block;width:60px;height:60px;line-height:60px;border-radius:50%;background-color:${green};color:#ffffff;font-size:28px;box-shadow:0 0 0 8px rgba(1,126,51,0.10);">&#10003;</span>
              </div>
              <h1 style="margin:22px 0 6px;text-align:center;color:${navy};font-size:27px;letter-spacing:-0.3px;">Registration Confirmed</h1>
              <p style="margin:0 0 26px;text-align:center;color:#6b7280;font-size:14px;">Your seat at the summit is secured, ${firstName}.</p>

              <p style="color:#3a3a4e;font-size:15px;line-height:1.7;margin:0 0 10px;">
                We're delighted to have you join student parliamentarians from across
                Nigeria at the <strong style="color:${navy};">Ife Education Parliamentary Summit 3.0</strong>
                for a day of dialogue, leadership and reform.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 0;background-color:#fff8dd;border:1px solid rgba(245,196,0,0.4);border-radius:14px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0 0 6px;color:#806600;font-size:11px;text-transform:uppercase;letter-spacing:2px;">Delegate WhatsApp Group</p>
                    <p style="margin:0;color:#3a3a4e;font-size:14px;line-height:1.7;">Join the delegate WhatsApp group for more information and live updates about IEPS 3.0.</p>
                    <p style="margin:12px 0 0;">
                      <a href="${DELEGATE_WHATSAPP_GROUP_URL}" style="display:inline-block;background-color:${gold};color:${navy};font-size:14px;font-weight:bold;text-decoration:none;padding:12px 22px;border-radius:999px;">Join Delegate WhatsApp Group</a>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Event details docket -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:26px 0;background-color:#f9f7f0;border-left:4px solid ${gold};border-radius:0 12px 12px 0;">
                <tr>
                  <td style="padding:6px 26px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:15px 0;border-bottom:1px solid #ebe7da;color:#806600;font-size:11px;text-transform:uppercase;letter-spacing:2px;width:82px;vertical-align:top;">Date</td>
                        <td style="padding:15px 0;border-bottom:1px solid #ebe7da;color:${navy};font-size:15px;font-weight:bold;">${EVENT.dateLabel}<br/><span style="font-weight:normal;color:#6b7280;font-size:13px;">${EVENT.timeLabel} (WAT)</span></td>
                      </tr>
                      <tr>
                        <td style="padding:15px 0;border-bottom:1px solid #ebe7da;color:#806600;font-size:11px;text-transform:uppercase;letter-spacing:2px;vertical-align:top;">Venue</td>
                        <td style="padding:15px 0;border-bottom:1px solid #ebe7da;color:${navy};font-size:15px;font-weight:bold;">${EVENT.venue.name}<br/><span style="font-weight:normal;color:#6b7280;font-size:13px;">${EVENT.venue.institution}, ${EVENT.venue.city}, ${EVENT.venue.state}</span></td>
                      </tr>
                      <tr>
                        <td style="padding:15px 0;color:#806600;font-size:11px;text-transform:uppercase;letter-spacing:2px;vertical-align:top;">Theme</td>
                        <td style="padding:15px 0;color:#3a3a4e;font-size:13px;line-height:1.6;font-style:italic;">${EVENT.theme}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="color:#3a3a4e;font-size:15px;line-height:1.7;margin:0;">
                Please keep this email as your confirmation. We look forward to seeing you!
              </p>
              <p style="color:#1a1a2e;font-size:15px;line-height:1.7;margin:26px 0 0;">
                Warm regards,<br/>
                <strong style="color:${navy};">The IEPS 3.0 Planning Committee</strong>
              </p>
            </td>
          </tr>

          ${emailFooterHtml(navy, gold)}

        </table>
        <p style="color:#9aa1b5;font-size:11px;margin:20px 0 0;">&copy; 2026 IEPS 3.0 | Education Students' Representative Council, OAU</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Plain-text fallback for clients that don't render HTML. */
export function confirmationEmailText({ fullName }: ConfirmationData): string {
  const firstName = fullName.split(" ")[0] || fullName;
  return [
    `Registration Confirmed: IEPS 3.0`,
    ``,
    `Dear ${firstName},`,
    ``,
    `Your registration for the Ife Education Parliamentary Summit 3.0 has been confirmed.`,
    ``,
    `Date:  ${EVENT.dateLabel}, ${EVENT.timeLabel}`,
    `Venue: ${EVENT.venue.name}, ${EVENT.venue.institution}, ${EVENT.venue.city}, ${EVENT.venue.state}`,
    `Theme: ${EVENT.theme}`,
    ``,
    `Delegate WhatsApp group: ${DELEGATE_WHATSAPP_GROUP_URL}`,
    ``,
    `We look forward to seeing you!`,
    ``,
    `The IEPS 3.0 Planning Committee`,
    SOCIALS.email,
  ].join("\n");
}

/* ────────────────────────────────────────────────────────────
 * Attendance acknowledgment email
 * ──────────────────────────────────────────────────────────── */

export const ATTENDANCE_SUBJECT = "Thanks for Attending: IEPS 3.0";

type AttendanceData = { fullName: string; email: string };

export function attendanceEmailHtml({ fullName }: AttendanceData): string {
  const navy = "#0D1B5E";
  const gold = "#F5C400";
  const green = "#017E33";
  const firstName = fullName.split(" ")[0] || fullName;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light only" />
  <title>${ATTENDANCE_SUBJECT}</title>
</head>
<body style="margin:0;padding:0;background-color:#eef1f8;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Your attendance at IEPS 3.0 has been recorded. Thank you for joining us.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef1f8;padding:36px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="620" cellpadding="0" cellspacing="0" style="width:620px;max-width:100%;background-color:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e2e6f1;box-shadow:0 12px 36px rgba(13,27,94,0.10);">

          <!-- Navy header with logo -->
          <tr>
            <td style="background-color:${navy};padding:36px 40px 30px;text-align:center;">
              ${emailHeaderHtml(navy, gold)}
            </td>
          </tr>
          <!-- gold hairline -->
          <tr><td style="height:3px;background-color:${gold};font-size:0;line-height:0;">&nbsp;</td></tr>

          <!-- Body -->
          <tr>
            <td style="padding:44px 44px 36px;">
              <div style="text-align:center;">
                <span style="display:inline-block;width:60px;height:60px;line-height:60px;border-radius:50%;background-color:${green};color:#ffffff;font-size:28px;box-shadow:0 0 0 8px rgba(1,126,51,0.10);">&#10003;</span>
              </div>
              <h1 style="margin:22px 0 6px;text-align:center;color:${navy};font-size:27px;letter-spacing:-0.3px;">Attendance Confirmed</h1>
              <p style="margin:0 0 26px;text-align:center;color:#6b7280;font-size:14px;">Thanks for being here today, ${firstName}.</p>

              <p style="color:#3a3a4e;font-size:15px;line-height:1.7;margin:0 0 10px;">
                We've marked you as present at the <strong style="color:${navy};">Ife Education Parliamentary Summit 3.0</strong>.
                It's great to have you with us for a day of dialogue, leadership and reform.
              </p>

              <p style="color:#3a3a4e;font-size:15px;line-height:1.7;margin:20px 0 0;">
                Your certificate of participation will be sent to this email address once it's ready.
              </p>
              <p style="color:#1a1a2e;font-size:15px;line-height:1.7;margin:26px 0 0;">
                Warm regards,<br/>
                <strong style="color:${navy};">The IEPS 3.0 Planning Committee</strong>
              </p>
            </td>
          </tr>

          ${emailFooterHtml(navy, gold)}

        </table>
        <p style="color:#9aa1b5;font-size:11px;margin:20px 0 0;">&copy; 2026 IEPS 3.0 | Education Students' Representative Council, OAU</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function attendanceEmailText({ fullName }: AttendanceData): string {
  const firstName = fullName.split(" ")[0] || fullName;
  return [
    `Attendance Confirmed: IEPS 3.0`,
    ``,
    `Dear ${firstName},`,
    ``,
    `We've marked you as present at the Ife Education Parliamentary Summit 3.0. Thanks for joining us!`,
    ``,
    `Your certificate of participation will be sent to this email address once it's ready.`,
    ``,
    `The IEPS 3.0 Planning Committee`,
    SOCIALS.email,
  ].join("\n");
}

/**
 * Sends the attendance acknowledgment email. Never throws — a mail failure
 * must not fail the attendance update. Returns a result the caller can log.
 */
export async function sendAttendanceEmail(
  data: AttendanceData
): Promise<SendResult> {
  const tx = getTransporter();
  if (!tx) {
    return { sent: false, reason: "SMTP is not configured" };
  }

  try {
    const info = await tx.sendMail({
      from: FROM,
      to: data.email,
      subject: ATTENDANCE_SUBJECT,
      html: attendanceEmailHtml(data),
      text: attendanceEmailText(data),
      attachments: logoAttachments(),
    });
    return { sent: true, id: info.messageId ?? null };
  } catch (err) {
    return {
      sent: false,
      reason: err instanceof Error ? err.message : "Unknown email error",
    };
  }
}

/* ────────────────────────────────────────────────────────────
 * Certificate delivery email
 * ──────────────────────────────────────────────────────────── */

export const CERTIFICATE_SUBJECT =
  "Your IEPS 3.0 Certificate of Participation";

type CertificateData = {
  fullName: string;
  email: string;
  downloadUrl: string;
};

export function certificateEmailHtml({
  fullName,
  downloadUrl,
}: CertificateData): string {
  const navy = "#0D1B5E";
  const gold = "#F5C400";
  const firstName = fullName.split(" ")[0] || fullName;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light only" />
  <title>${CERTIFICATE_SUBJECT}</title>
</head>
<body style="margin:0;padding:0;background-color:#eef1f8;font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Your IEPS 3.0 certificate of participation is ready to download.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef1f8;padding:36px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="620" cellpadding="0" cellspacing="0" style="width:620px;max-width:100%;background-color:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e2e6f1;box-shadow:0 12px 36px rgba(13,27,94,0.10);">

          <!-- Navy header with logo -->
          <tr>
            <td style="background-color:${navy};padding:36px 40px 30px;text-align:center;">
              ${emailHeaderHtml(navy, gold)}
            </td>
          </tr>
          <!-- gold hairline -->
          <tr><td style="height:3px;background-color:${gold};font-size:0;line-height:0;">&nbsp;</td></tr>

          <!-- Body -->
          <tr>
            <td style="padding:44px 44px 36px;">
              <h1 style="margin:0 0 6px;text-align:center;color:${navy};font-size:27px;letter-spacing:-0.3px;">Your Certificate is Ready</h1>
              <p style="margin:0 0 26px;text-align:center;color:#6b7280;font-size:14px;">Thank you for being part of IEPS 3.0, ${firstName}.</p>

              <p style="color:#3a3a4e;font-size:15px;line-height:1.7;margin:0 0 10px;">
                Your <strong style="color:${navy};">Certificate of Participation</strong> is attached to
                this email — you can also download it any time with the button below.
              </p>

              <div style="text-align:center;margin:30px 0;">
                <a href="${downloadUrl}" style="display:inline-block;background-color:${gold};color:${navy};font-size:15px;font-weight:bold;text-decoration:none;padding:15px 38px;border-radius:999px;">Download Certificate</a>
              </div>

              <!-- Event recap docket -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:26px 0;background-color:#f9f7f0;border-left:4px solid ${gold};border-radius:0 12px 12px 0;">
                <tr>
                  <td style="padding:20px 26px;">
                    <p style="margin:0 0 6px;color:#806600;font-size:11px;text-transform:uppercase;letter-spacing:2px;">Event recap</p>
                    <p style="margin:0;color:${navy};font-size:15px;font-weight:bold;">${EVENT.dateLabel}</p>
                    <p style="margin:6px 0 0;color:#3a3a4e;font-size:13px;font-style:italic;line-height:1.6;">${EVENT.theme}</p>
                  </td>
                </tr>
              </table>

              <p style="color:#1a1a2e;font-size:15px;line-height:1.7;margin:24px 0 0;">
                We hope to see you at <strong style="color:${navy};">IEPS 4.0</strong>!<br/><br/>
                Warm regards,<br/>
                <strong style="color:${navy};">The IEPS 3.0 Planning Committee</strong>
              </p>
            </td>
          </tr>

          ${emailFooterHtml(navy, gold)}

        </table>
        <p style="color:#9aa1b5;font-size:11px;margin:20px 0 0;">&copy; 2026 IEPS 3.0 | Education Students' Representative Council, OAU</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function certificateEmailText({
  fullName,
  downloadUrl,
}: CertificateData): string {
  const firstName = fullName.split(" ")[0] || fullName;
  return [
    `Your IEPS 3.0 Certificate of Participation`,
    ``,
    `Dear ${firstName},`,
    ``,
    `Thank you for participating in IEPS 3.0. Your certificate of participation is attached, and can also be downloaded here:`,
    downloadUrl,
    ``,
    `Event recap`,
    `Date:  ${EVENT.dateLabel}`,
    `Theme: ${EVENT.theme}`,
    ``,
    `We hope to see you at IEPS 4.0!`,
    ``,
    `The IEPS 3.0 Planning Committee`,
  ].join("\n");
}

type SendResult =
  | { sent: true; id: string | null }
  | { sent: false; reason: string };

/**
 * Sends the confirmation email. Never throws — a mail failure must not fail a
 * registration. Returns a result the caller can log.
 */
export async function sendConfirmationEmail(
  data: ConfirmationData
): Promise<SendResult> {
  const tx = getTransporter();
  if (!tx) {
    return { sent: false, reason: "SMTP is not configured" };
  }

  try {
    const info = await tx.sendMail({
      from: FROM,
      to: data.email,
      subject: CONFIRMATION_SUBJECT,
      html: confirmationEmailHtml(data),
      text: confirmationEmailText(data),
      attachments: logoAttachments(),
    });
    return { sent: true, id: info.messageId ?? null };
  } catch (err) {
    return {
      sent: false,
      reason: err instanceof Error ? err.message : "Unknown email error",
    };
  }
}

/* ────────────────────────────────────────────────────────────
 * Contact form
 * ──────────────────────────────────────────────────────────── */

type ContactMessage = { name: string; email: string; message: string };

function contactEmailHtml({ name, email, message }: ContactMessage): string {
  const navy = "#0D1B5E";
  const gold = "#F5C400";
  const safe = message
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/\n/g, "<br/>");
  return `<!doctype html><html><body style="margin:0;background:#f8f8f4;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:560px;max-width:100%;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 8px 30px rgba(13,27,94,0.12);">
        <tr><td style="background:${navy};padding:22px 32px;text-align:center;">
          ${
            HAS_LOGO
              ? `<span style="display:inline-block;background-color:#ffffff;padding:8px 14px;border-radius:10px;line-height:0;"><img src="cid:${LOGO_CID}" alt="IEPS 3.0" width="150" style="display:block;width:150px;max-width:100%;height:auto;border:0;" /></span>`
              : `<span style="color:#fff;font-size:20px;font-weight:bold;">IEPS</span><span style="background:${gold};color:${navy};font-size:12px;font-weight:bold;padding:2px 8px;border-radius:999px;margin-left:5px;">3.0</span>`
          }
          <div style="color:${gold};font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-top:6px;">New contact message</div>
        </td></tr>
        <tr><td style="padding:28px 32px;">
          <p style="margin:0 0 4px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;">From</p>
          <p style="margin:0 0 16px;color:${navy};font-size:16px;font-weight:bold;">${name} &lt;${email}&gt;</p>
          <p style="margin:0 0 4px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Message</p>
          <p style="margin:0;color:#1a1a2e;font-size:15px;line-height:1.6;">${safe}</p>
        </td></tr>
        <tr><td style="height:5px;background:#F5C400;"></td></tr>
      </table>
    </td></tr>
  </table></body></html>`;
}

/**
 * Sends a contact-form submission to the organiser. Reply-To is the submitter
 * so the organiser can respond directly. Best-effort result, never throws.
 */
export async function sendContactEmail(
  data: ContactMessage
): Promise<SendResult> {
  const tx = getTransporter();
  if (!tx) {
    return { sent: false, reason: "SMTP is not configured" };
  }
  try {
    const info = await tx.sendMail({
      from: FROM,
      to: CONTACT.email,
      replyTo: data.email,
      subject: `New IEPS 3.0 contact message from ${data.name}`,
      html: contactEmailHtml(data),
      text: `From: ${data.name} <${data.email}>\n\n${data.message}`,
      attachments: logoAttachments(),
    });
    return { sent: true, id: info.messageId ?? null };
  } catch (err) {
    return {
      sent: false,
      reason: err instanceof Error ? err.message : "Unknown email error",
    };
  }
}

/* ────────────────────────────────────────────────────────────
 * Broadcast / bulk email
 * ──────────────────────────────────────────────────────────── */

/** Wraps a plain-text admin message in branded HTML. */
export function broadcastEmailHtml(subject: string, message: string): string {
  const navy = "#0D1B5E";
  const gold = "#F5C400";
  const body = message
    .split(/\n{2,}/)
    .map(
      (para) =>
        `<p style="color:#3a3a4e;font-size:16px;line-height:1.6;margin:0 0 16px;">${para
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/\n/g, "<br/>")}</p>`
    )
    .join("");

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>${subject}</title></head>
<body style="margin:0;padding:0;background-color:#f8f8f4;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;background-color:#f8f8f4;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(13,27,94,0.12);">
        <tr><td style="background:${navy};padding:28px 40px;text-align:center;">
          ${
            HAS_LOGO
              ? `<span style="display:inline-block;background-color:#ffffff;padding:10px 18px;border-radius:12px;line-height:0;"><img src="cid:${LOGO_CID}" alt="IEPS 3.0" width="180" style="display:block;width:180px;max-width:100%;height:auto;border:0;" /></span>`
              : `<span style="font-size:26px;font-weight:bold;color:#fff;">IEPS</span><span style="display:inline-block;background:${gold};color:${navy};font-size:13px;font-weight:bold;padding:2px 10px;border-radius:999px;margin-left:6px;">3.0</span>`
          }
        </td></tr>
        <tr><td style="padding:36px 40px;">
          ${body}
        </td></tr>
        ${emailFooterHtml(navy, gold)}
      </table>
    </td></tr>
  </table>
</body></html>`;
}

/**
 * Sends a broadcast email to many recipients. Best-effort: returns how many
 * were dispatched. Sends in small concurrent batches to respect SMTP limits.
 */
export async function sendBulkEmail(
  recipients: string[],
  subject: string,
  message: string
): Promise<{ sent: number; failed: number; reason?: string }> {
  const tx = getTransporter();
  if (!tx) {
    return { sent: 0, failed: recipients.length, reason: "SMTP is not configured" };
  }

  const html = broadcastEmailHtml(subject, message);
  const text = message;
  let sent = 0;
  let failed = 0;

  const BATCH = 10;
  for (let i = 0; i < recipients.length; i += BATCH) {
    const chunk = recipients.slice(i, i + BATCH);
    const results = await Promise.allSettled(
      chunk.map((to) =>
        tx.sendMail({
          from: FROM,
          to,
          subject,
          html,
          text,
          attachments: logoAttachments(),
        })
      )
    );
    for (const r of results) {
      if (r.status === "fulfilled") sent += 1;
      else failed += 1;
    }
  }

  return { sent, failed };
}

/**
 * Sends the certificate-delivery email with the PDF attached. Best-effort —
 * returns a result instead of throwing.
 */
export async function sendCertificateEmail(
  data: CertificateData,
  pdf: { filename: string; buffer: Buffer }
): Promise<SendResult> {
  const tx = getTransporter();
  if (!tx) {
    return { sent: false, reason: "SMTP is not configured" };
  }

  try {
    const info = await tx.sendMail({
      from: FROM,
      to: data.email,
      subject: CERTIFICATE_SUBJECT,
      html: certificateEmailHtml(data),
      text: certificateEmailText(data),
      attachments: [
        {
          filename: pdf.filename,
          content: pdf.buffer,
        },
        ...logoAttachments(),
      ],
    });
    return { sent: true, id: info.messageId ?? null };
  } catch (err) {
    return {
      sent: false,
      reason: err instanceof Error ? err.message : "Unknown email error",
    };
  }
}
