import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getBaseUrl } from "@/lib/utils";
import { issueCertificate, type IssueResult } from "@/lib/certificate-service";
import { requireRole, forbidden } from "@/lib/admin";

export const runtime = "nodejs";
// Bulk generation can take a while; opt out of static optimisation.
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * POST /api/admin/generate-all-certificates — admin-only.
 * Issues certificates for every registration with `attended: true`.
 */
export async function POST(request: Request) {
  // Certificate issuance is off-limits to the registration team.
  if (!(await requireRole("ADMIN", "SUPER_ADMIN"))) return forbidden();

  const attendees = await prisma.registration.findMany({
    where: { attended: true },
    select: { id: true, fullName: true, email: true },
    orderBy: { createdAt: "asc" },
  });

  if (attendees.length === 0) {
    return NextResponse.json(
      { message: "No attendees marked as present.", total: 0, succeeded: 0, failed: 0, results: [] },
      { status: 200 }
    );
  }

  const baseUrl = getBaseUrl(request);
  const results: IssueResult[] = [];
  const failures: { registrationId: string; error: string }[] = [];

  // Sequential to stay within memory/rate limits.
  for (const attendee of attendees) {
    try {
      const result = await issueCertificate(attendee, baseUrl);
      results.push(result);
    } catch (err) {
      failures.push({
        registrationId: attendee.id,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return NextResponse.json(
    {
      total: attendees.length,
      succeeded: results.length,
      failed: failures.length,
      emailsSent: results.filter((r) => r.emailSent).length,
      results,
      failures,
    },
    { status: 200 }
  );
}
