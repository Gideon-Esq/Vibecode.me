import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AuthError, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { regenerateDay } from "@/lib/ai/planner";
import { describeAiError } from "@/lib/ai/client";
import { getOwnedTrip, parsePlan } from "@/lib/trips";

export const maxDuration = 300;

const bodySchema = z.object({
  day: z.number().int().min(1),
  instructions: z.string().max(1000).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const trip = await getOwnedTrip(id, user.id);
    if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

    const rl = rateLimit(`regen:${user.id}`, { limit: 10, windowMs: 5 * 60_000 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Regeneration limit reached — try again shortly" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
      );
    }

    const plan = parsePlan(trip);
    if (!plan) return NextResponse.json({ error: "Trip has no plan yet" }, { status: 400 });

    const body = bodySchema.safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const newDay = await regenerateDay(plan, body.data.day, body.data.instructions);

    const updatedPlan = {
      ...plan,
      itinerary: plan.itinerary.map((d) => (d.day === newDay.day ? newDay : d)),
    };
    await db.trip.update({
      where: { id: trip.id },
      data: { plan: JSON.stringify(updatedPlan) },
    });

    return NextResponse.json({ day: newDay });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json(
      { error: describeAiError(err) ?? "Couldn't regenerate that day. Please try again." },
      { status: 502 },
    );
  }
}
