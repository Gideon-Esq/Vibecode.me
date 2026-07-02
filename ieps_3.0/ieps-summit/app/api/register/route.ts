import { NextResponse } from "next/server";
import { Prisma, AttendeeRole, RegistrationStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { registrationSchema } from "@/lib/registration";
import { sendConfirmationEmail } from "@/lib/email";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // 0. Rate limit — generous enough for a shared campus network, tight
  //    enough to blunt scripted spam.
  const rl = rateLimit(`register:${clientIp(request)}`, 20, 10 * 60 * 1000);
  if (!rl.ok) return tooManyRequests(rl.retryAfterSec);

  // 1. Parse + validate body
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = registrationSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 422 }
    );
  }

  const data = parsed.data;
  const { sessionInterest, ...rest } = data;

  // 2. Duplicate check
  const existing = await prisma.registration.findUnique({
    where: { email: data.email },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      {
        error: "This email address is already registered for IEPS 3.0.",
        code: "DUPLICATE_EMAIL",
      },
      { status: 409 }
    );
  }

  // 3. Persist (registration + session interests in one transaction)
  let registration;
  try {
    registration = await prisma.registration.create({
      data: {
        ...rest,
        // Self-registration is always a Student; admins assign other roles.
        role: AttendeeRole.STUDENT,
        // Registrations are confirmed immediately — no pending review step.
        status: RegistrationStatus.CONFIRMED,
        sessionInterest: {
          create: sessionInterest.map((sessionName) => ({ sessionName })),
        },
      },
      select: { id: true, fullName: true, email: true },
    });
  } catch (err) {
    // Handle a race where two requests pass the duplicate check simultaneously.
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error: "This email address is already registered for IEPS 3.0.",
          code: "DUPLICATE_EMAIL",
        },
        { status: 409 }
      );
    }
    console.error("[register] failed to persist registration:", err);
    return NextResponse.json(
      { error: "Something went wrong saving your registration. Please try again." },
      { status: 500 }
    );
  }

  // 4. Confirmation email (best-effort — never blocks success)
  const emailResult = await sendConfirmationEmail({
    fullName: registration.fullName,
    email: registration.email,
  });
  if (!emailResult.sent) {
    console.warn(
      `[register] confirmation email not sent (${emailResult.reason}) for ${registration.email}`
    );
  }

  // 5. Analytics event (best-effort)
  try {
    await prisma.analyticsEvent.create({
      data: {
        type: "REGISTRATION",
        metadata: {
          registrationId: registration.id,
          institution: data.institution,
          level: data.level,
        },
      },
    });
  } catch (err) {
    console.warn("[register] failed to log analytics event:", err);
  }

  // 6. Done
  return NextResponse.json(
    {
      id: registration.id,
      fullName: registration.fullName,
      email: registration.email,
      emailSent: emailResult.sent,
    },
    { status: 201 }
  );
}
