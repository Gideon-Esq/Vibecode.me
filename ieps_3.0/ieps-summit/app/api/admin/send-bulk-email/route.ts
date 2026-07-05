import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireRole, forbidden } from "@/lib/admin";
import { sendBulkEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const bodySchema = z.object({
  subject: z.string().trim().min(2, "Subject is required").max(160),
  message: z.string().trim().min(2, "Message is required").max(5000),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "ALL"]).default("ALL"),
});

/** POST /api/admin/send-bulk-email — broadcast to all or filtered registrants. */
export async function POST(request: Request) {
  if (!(await requireRole("ADMIN", "SUPER_ADMIN"))) return forbidden();

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { subject, message, status } = parsed.data;
  const where: Prisma.RegistrationWhereInput =
    status === "ALL"
      ? {}
      : { status: status as Prisma.RegistrationWhereInput["status"] };

  const recipients = await prisma.registration.findMany({
    where,
    select: { email: true },
  });

  if (recipients.length === 0) {
    return NextResponse.json(
      { message: "No recipients matched.", recipients: 0, sent: 0, failed: 0 },
      { status: 200 }
    );
  }

  const result = await sendBulkEmail(
    recipients.map((r) => r.email),
    subject,
    message
  );

  return NextResponse.json({
    recipients: recipients.length,
    sent: result.sent,
    failed: result.failed,
    reason: result.reason,
  });
}
