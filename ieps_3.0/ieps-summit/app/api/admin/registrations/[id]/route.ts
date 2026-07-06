import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  requireAdmin,
  requireRole,
  isPrivileged,
  unauthorized,
  forbidden,
  serializeRegistration,
  registrationSelect,
} from "@/lib/admin";
import { sendAttendanceEmail } from "@/lib/email";

export const runtime = "nodejs";

type Ctx = { params: { id: string } };

/** GET /api/admin/registrations/[id] */
export async function GET(_request: Request, { params }: Ctx) {
  if (!(await requireAdmin())) return unauthorized();

  const registration = await prisma.registration.findUnique({
    where: { id: params.id },
    select: registrationSelect,
  });
  if (!registration) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(serializeRegistration(registration));
}

const patchSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]).optional(),
  attended: z.boolean().optional(),
});

/** PATCH /api/admin/registrations/[id] — update status / attendance. */
export async function PATCH(request: Request, { params }: Ctx) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  // The registration team may only mark attendance — never change status.
  if (!isPrivileged(session.user.role) && parsed.data.status !== undefined) {
    return forbidden();
  }

  try {
    // Fetch the prior attendance state so a repeat "mark attended" (e.g. a
    // bulk "mark page attended" pass) doesn't re-send the acknowledgment.
    const wasAttended =
      parsed.data.attended === true
        ? (
            await prisma.registration.findUnique({
              where: { id: params.id },
              select: { attended: true },
            })
          )?.attended ?? false
        : true;

    const updated = await prisma.registration.update({
      where: { id: params.id },
      data: parsed.data,
      select: registrationSelect,
    });

    if (parsed.data.attended === true && !wasAttended) {
      const emailResult = await sendAttendanceEmail({
        fullName: updated.fullName,
        email: updated.email,
      });
      if (!emailResult.sent) {
        console.warn(
          `[admin/registrations] attendance email not sent (${emailResult.reason}) for ${updated.email}`
        );
      }
    }

    return NextResponse.json(serializeRegistration(updated));
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    throw err;
  }
}

/** DELETE /api/admin/registrations/[id] */
export async function DELETE(_request: Request, { params }: Ctx) {
  if (!(await requireRole("ADMIN", "SUPER_ADMIN"))) return forbidden();

  try {
    await prisma.registration.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    throw err;
  }
}
