import { prisma } from "@/lib/db";
import { generateCertificate, certificateFilename } from "@/lib/certificate";
import { isCloudinaryConfigured, uploadCertificate } from "@/lib/cloudinary";
import { sendCertificateEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/constants";

export type IssueResult = {
  registrationId: string;
  fullName: string;
  url: string;
  emailSent: boolean;
  emailReason?: string;
};

/**
 * End-to-end certificate issuance for a single registration:
 * generate the PDF → upload to Cloudinary (or fall back to the app's own public
 * stream URL) → email it to the attendee → persist the URL + sent flag.
 */
export async function issueCertificate(
  registration: { id: string; fullName: string; email: string }
): Promise<IssueResult> {
  const buffer = await generateCertificate(
    registration.fullName,
    registration.id
  );
  const filename = certificateFilename(registration.id);

  // Prefer a durable Cloudinary URL; otherwise serve via our public endpoint
  // (which regenerates the identical PDF on demand). Built from the
  // canonical SITE_URL (NEXT_PUBLIC_APP_URL), NOT the request's own host —
  // deriving it from the request meant a certificate generated from a
  // Codespaces preview or a Vercel preview deployment permanently baked
  // that ephemeral host into the stored URL.
  const url = isCloudinaryConfigured()
    ? await uploadCertificate(buffer, filename)
    : `${SITE_URL}/api/certificate/${registration.id}`;

  const email = await sendCertificateEmail(
    {
      fullName: registration.fullName,
      email: registration.email,
      downloadUrl: url,
    },
    { filename, buffer }
  );

  await prisma.registration.update({
    where: { id: registration.id },
    data: { certificateUrl: url, certificateSent: email.sent },
  });

  return {
    registrationId: registration.id,
    fullName: registration.fullName,
    url,
    emailSent: email.sent,
    emailReason: email.sent ? undefined : email.reason,
  };
}
