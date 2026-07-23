import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole, forbidden } from "@/lib/admin";
import { sendBulkEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  email: z.string().trim().email("A valid recipient email is required"),
  subject: z.string().trim().min(2, "Subject is required").max(160),
  message: z.string().trim().min(2, "Message is required").max(5000),
});

/**
 * POST /api/admin/send-email — send one branded email to a single recipient.
 * Reuses the broadcast template/sender with a one-element recipient list.
 */
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

  const { email, subject, message } = parsed.data;
  const result = await sendBulkEmail([email], subject, message);

  if (result.sent === 0) {
    return NextResponse.json(
      { error: result.reason ?? "Failed to send email.", sent: 0, failed: result.failed },
      { status: 502 }
    );
  }

  return NextResponse.json({ sent: result.sent, failed: result.failed });
}
