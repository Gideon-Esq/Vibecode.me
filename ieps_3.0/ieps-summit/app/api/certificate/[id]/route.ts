import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateCertificate, certificateFilename } from "@/lib/certificate";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/rate-limit";

export const runtime = "nodejs";

/** URL-safe slug of the attendee's name for a friendly download filename. */
function nameSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "participant"
  );
}

/**
 * GET /api/certificate/[id] — public certificate download.
 * Streams the PDF for a registration that exists and has had a certificate
 * issued (certificateUrl set). Regenerates deterministically on demand.
 *
 * Pass `?download=1` to force a browser download (attachment) with a name-based
 * filename; without it the PDF opens inline (used by email links).
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Rate limit — PDF rendering is CPU-heavy and the endpoint is public.
  const rl = rateLimit(`certificate:${clientIp(request)}`, 30, 5 * 60 * 1000);
  if (!rl.ok) return tooManyRequests(rl.retryAfterSec);

  const registration = await prisma.registration.findUnique({
    where: { id: params.id },
    select: { id: true, fullName: true, certificateUrl: true },
  });

  if (!registration || !registration.certificateUrl) {
    return NextResponse.json(
      { error: "Certificate not found" },
      { status: 404 }
    );
  }

  const asDownload =
    new URL(request.url).searchParams.get("download") === "1";

  try {
    const pdf = await generateCertificate(
      registration.fullName,
      registration.id
    );

    const filename = asDownload
      ? `IEPS-3.0-Certificate-${nameSlug(registration.fullName)}.pdf`
      : certificateFilename(registration.id);
    const disposition = asDownload ? "attachment" : "inline";

    return new Response(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${disposition}; filename="${filename}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("[certificate] stream failed:", err);
    return NextResponse.json(
      { error: "Failed to render certificate" },
      { status: 500 }
    );
  }
}
