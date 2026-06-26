import nodemailer, { type Transporter } from "nodemailer";
import { EVENT, CONTACT, ORGANIZERS } from "@/lib/constants";

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
  "Registration Confirmed — IEPS 3.0 | 22nd July 2026";

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
  const green = "#1A7A3C";
  const firstName = fullName.split(" ")[0] || fullName;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light only" />
  <title>${CONFIRMATION_SUBJECT}</title>
</head>
<body style="margin:0;padding:0;background-color:#f8f8f4;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">You're confirmed for IEPS 3.0 — ${EVENT.dateLabel} at ${EVENT.venue.shortName}.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f8f4;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(13,27,94,0.12);">

          <!-- Navy header -->
          <tr>
            <td style="background-color:${navy};padding:32px 40px;text-align:center;">
              <span style="font-size:30px;font-weight:bold;color:#ffffff;letter-spacing:-0.5px;">IEPS</span>
              <span style="display:inline-block;background-color:${gold};color:${navy};font-size:15px;font-weight:bold;padding:3px 12px;border-radius:999px;margin-left:6px;vertical-align:middle;">3.0</span>
              <div style="margin-top:8px;font-size:11px;letter-spacing:3px;color:${gold};text-transform:uppercase;">Ife Education Parliamentary Summit</div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <div style="text-align:center;margin-bottom:8px;">
                <span style="display:inline-block;width:64px;height:64px;line-height:64px;border-radius:50%;background-color:${green};color:#ffffff;font-size:32px;">&#10003;</span>
              </div>
              <h1 style="margin:16px 0 8px;text-align:center;color:${gold};font-size:26px;">Registration Confirmed!</h1>

              <p style="color:#1a1a2e;font-size:16px;line-height:1.6;margin:20px 0 0;">Dear ${firstName},</p>
              <p style="color:#3a3a4e;font-size:16px;line-height:1.6;margin:12px 0;">
                Your registration for the <strong>Ife Education Parliamentary Summit 3.0</strong> has been confirmed. We're delighted to have you join student parliamentarians from across Nigeria for a day of dialogue, leadership and reform.
              </p>

              <!-- Event details block -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;background-color:#f8f8f4;border-radius:12px;border:1px solid #e6e6dd;">
                <tr>
                  <td style="padding:24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;color:${green};font-size:12px;text-transform:uppercase;letter-spacing:1.5px;width:90px;vertical-align:top;">Date</td>
                        <td style="padding:8px 0;color:${navy};font-size:15px;font-weight:bold;">${EVENT.dateLabel}, ${EVENT.timeLabel}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:${green};font-size:12px;text-transform:uppercase;letter-spacing:1.5px;vertical-align:top;">Venue</td>
                        <td style="padding:8px 0;color:${navy};font-size:15px;font-weight:bold;">${EVENT.venue.name}, ${EVENT.venue.institution}, ${EVENT.venue.city}, ${EVENT.venue.state}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:${green};font-size:12px;text-transform:uppercase;letter-spacing:1.5px;vertical-align:top;">Theme</td>
                        <td style="padding:8px 0;color:#1a1a2e;font-size:14px;line-height:1.5;font-style:italic;">${EVENT.theme}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="color:#3a3a4e;font-size:16px;line-height:1.6;margin:12px 0;">
                Please keep this email as confirmation of your registration. We look forward to seeing you!
              </p>
              <p style="color:#1a1a2e;font-size:16px;line-height:1.6;margin:24px 0 0;">
                Warm regards,<br/>
                <strong>The IEPS 3.0 Organising Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:${navy};padding:28px 40px;text-align:center;">
              <p style="margin:0 0 6px;color:#ffffff;font-size:13px;">
                ${CONTACT.name} &middot; ${CONTACT.role}
              </p>
              <p style="margin:0 0 10px;color:rgba(255,255,255,0.7);font-size:13px;">
                <a href="mailto:${CONTACT.email}" style="color:${gold};text-decoration:none;">${CONTACT.email}</a>
                &nbsp;&middot;&nbsp;
                <a href="tel:${CONTACT.phoneIntl}" style="color:${gold};text-decoration:none;">${CONTACT.phone}</a>
              </p>
              <p style="margin:0;color:rgba(255,255,255,0.5);font-size:11px;">
                Organised by ${ORGANIZERS.map((o) => o.abbr).join(" &middot; ")}
              </p>
            </td>
          </tr>
          <tr><td style="height:5px;background-color:${gold};"></td></tr>

        </table>
        <p style="color:#9a9a9a;font-size:11px;margin:18px 0 0;">&copy; 2026 IEPS 3.0 — Education Students' Representative Council, OAU</p>
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
    `Registration Confirmed — IEPS 3.0`,
    ``,
    `Dear ${firstName},`,
    ``,
    `Your registration for the Ife Education Parliamentary Summit 3.0 has been confirmed.`,
    ``,
    `Date:  ${EVENT.dateLabel}, ${EVENT.timeLabel}`,
    `Venue: ${EVENT.venue.name}, ${EVENT.venue.institution}, ${EVENT.venue.city}, ${EVENT.venue.state}`,
    `Theme: ${EVENT.theme}`,
    ``,
    `We look forward to seeing you!`,
    ``,
    `— The IEPS 3.0 Organising Team`,
    `${CONTACT.email} · ${CONTACT.phone}`,
  ].join("\n");
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
  const green = "#1A7A3C";
  const firstName = fullName.split(" ")[0] || fullName;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light only" />
  <title>${CERTIFICATE_SUBJECT}</title>
</head>
<body style="margin:0;padding:0;background-color:#f8f8f4;font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Your IEPS 3.0 certificate of participation is ready to download.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f8f4;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(13,27,94,0.12);">

          <!-- Navy header -->
          <tr>
            <td style="background-color:${navy};padding:32px 40px;text-align:center;">
              <span style="font-size:30px;font-weight:bold;color:#ffffff;letter-spacing:-0.5px;">IEPS</span>
              <span style="display:inline-block;background-color:${gold};color:${navy};font-size:15px;font-weight:bold;padding:3px 12px;border-radius:999px;margin-left:6px;vertical-align:middle;">3.0</span>
              <div style="margin-top:8px;font-size:11px;letter-spacing:3px;color:${gold};text-transform:uppercase;">Ife Education Parliamentary Summit</div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h1 style="margin:0 0 8px;text-align:center;color:${gold};font-size:26px;">Your Certificate is Ready!</h1>

              <p style="color:#1a1a2e;font-size:16px;line-height:1.6;margin:20px 0 0;">Dear ${firstName},</p>
              <p style="color:#3a3a4e;font-size:16px;line-height:1.6;margin:12px 0;">
                Thank you for participating in <strong>IEPS 3.0</strong>. Your certificate of participation is attached to this email, and you can also download it using the button below.
              </p>

              <div style="text-align:center;margin:32px 0;">
                <a href="${downloadUrl}" style="display:inline-block;background-color:${gold};color:${navy};font-size:16px;font-weight:bold;text-decoration:none;padding:14px 34px;border-radius:999px;">Download Certificate</a>
              </div>

              <!-- Event recap -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;background-color:#f8f8f4;border-radius:12px;border:1px solid #e6e6dd;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 6px;color:${green};font-size:12px;text-transform:uppercase;letter-spacing:1.5px;">Event recap</p>
                    <p style="margin:0;color:${navy};font-size:15px;font-weight:bold;">${EVENT.dateLabel}</p>
                    <p style="margin:6px 0 0;color:#1a1a2e;font-size:13px;font-style:italic;line-height:1.5;">${EVENT.theme}</p>
                  </td>
                </tr>
              </table>

              <p style="color:#1a1a2e;font-size:16px;line-height:1.6;margin:24px 0 0;">
                We hope to see you at <strong>IEPS 4.0</strong>!<br/><br/>
                Warm regards,<br/>
                <strong>The IEPS 3.0 Organising Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:${navy};padding:24px 40px;text-align:center;">
              <p style="margin:0;color:rgba(255,255,255,0.7);font-size:13px;">
                <a href="mailto:${CONTACT.email}" style="color:${gold};text-decoration:none;">${CONTACT.email}</a>
                &nbsp;&middot;&nbsp;
                <a href="tel:${CONTACT.phoneIntl}" style="color:${gold};text-decoration:none;">${CONTACT.phone}</a>
              </p>
            </td>
          </tr>
          <tr><td style="height:5px;background-color:${gold};"></td></tr>

        </table>
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
    `— The IEPS 3.0 Organising Team`,
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
        <tr><td style="background:${navy};padding:22px 32px;">
          <span style="color:#fff;font-size:20px;font-weight:bold;">IEPS</span><span style="background:${gold};color:${navy};font-size:12px;font-weight:bold;padding:2px 8px;border-radius:999px;margin-left:5px;">3.0</span>
          <div style="color:${gold};font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-top:4px;">New contact message</div>
        </td></tr>
        <tr><td style="padding:28px 32px;">
          <p style="margin:0 0 4px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;">From</p>
          <p style="margin:0 0 16px;color:${navy};font-size:16px;font-weight:bold;">${name} &lt;${email}&gt;</p>
          <p style="margin:0 0 4px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Message</p>
          <p style="margin:0;color:#1a1a2e;font-size:15px;line-height:1.6;">${safe}</p>
        </td></tr>
        <tr><td style="height:5px;background:${gold};"></td></tr>
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
          <span style="font-size:26px;font-weight:bold;color:#fff;">IEPS</span>
          <span style="display:inline-block;background:${gold};color:${navy};font-size:13px;font-weight:bold;padding:2px 10px;border-radius:999px;margin-left:6px;">3.0</span>
        </td></tr>
        <tr><td style="padding:36px 40px;">
          <h1 style="margin:0 0 18px;color:${navy};font-size:22px;">${subject}</h1>
          ${body}
        </td></tr>
        <tr><td style="background:${navy};padding:18px;text-align:center;">
          <a href="mailto:${CONTACT.email}" style="color:${gold};text-decoration:none;font-size:13px;">${CONTACT.email}</a>
        </td></tr>
        <tr><td style="height:5px;background:${gold};"></td></tr>
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
      chunk.map((to) => tx.sendMail({ from: FROM, to, subject, html, text }))
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
