import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateCertificate, certificateFilename } from "@/lib/certificate";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * GET /api/certificate/[id] — public certificate download.
 * Streams the PDF for a registration that exists and has had a certificate
 * issued (certificateUrl set). Regenerates deterministically on demand.
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

  try {
    const pdf = await generateCertificate(
      registration.fullName,
      registration.id
    );

    return new Response(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${certificateFilename(registration.id)}"`,
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
