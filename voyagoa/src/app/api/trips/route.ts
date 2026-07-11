import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AuthError, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { parseIntake } from "@/lib/ai/planner";
import { describeAiError } from "@/lib/ai/client";

const createSchema = z.object({
  request: z.string().min(10, "Tell Voyagoa a bit more about the trip").max(4000),
});

export async function GET() {
  try {
    const user = await requireUser();
    const trips = await db.trip.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        destinationCity: true,
        destinationCountry: true,
        startDate: true,
        endDate: true,
        days: true,
        totalBudget: true,
        currency: true,
        updatedAt: true,
      },
    });
    return NextResponse.json({ trips });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    const rl = rateLimit(`trip-create:${user.id}`, { limit: 10, windowMs: 60_000 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Slow down a little — try again in a few seconds" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
      );
    }

    const body = createSchema.safeParse(await req.json().catch(() => null));
    if (!body.success) {
      return NextResponse.json(
        { error: body.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const intake = await parseIntake(body.data.request, {
      homeCity: user.homeCity,
      passportCountry: user.passportCountry,
    });

    const trip = await db.trip.create({
      data: {
        userId: user.id,
        request: body.data.request,
        status: intake.complete ? "planning" : "intake",
        title: intake.destinationCity
          ? `Trip to ${intake.destinationCity}`
          : "New trip",
        originCity: intake.originCity,
        destinationCity: intake.destinationCity,
        startDate: intake.startDate,
        endDate: intake.endDate,
        days: intake.days,
        travelers: intake.travelers,
        currency: intake.currency,
        totalBudget: intake.totalBudget,
        passportCountry: intake.passportCountry,
        intake: JSON.stringify(intake),
      },
    });

    return NextResponse.json({ trip: { id: trip.id, status: trip.status }, intake });
  } catch (err) {
    return handleError(err);
  }
}

function handleError(err: unknown) {
  if (err instanceof AuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  const aiMessage = describeAiError(err);
  if (aiMessage) return NextResponse.json({ error: aiMessage }, { status: 502 });
  console.error(err);
  return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
}
