import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AuthError, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { generateTripPlan, parseIntake } from "@/lib/ai/planner";
import { describeAiError } from "@/lib/ai/client";
import { getOwnedTrip, parseIntakeJson, savePlan } from "@/lib/trips";

export const maxDuration = 300; // Vercel Hobby cap; planning can take a few minutes

const bodySchema = z.object({
  answers: z.string().max(2000).optional(),
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

    const rl = rateLimit(`plan:${user.id}`, { limit: 5, windowMs: 5 * 60_000 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Planning limit reached — try again in a few minutes" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
      );
    }

    const body = bodySchema.safeParse(await req.json().catch(() => ({})));
    const answers = body.success ? body.data.answers?.trim() : undefined;

    let intake = parseIntakeJson(trip);
    let request = trip.request;

    // Follow-up answers get folded into the request and re-parsed.
    if (answers) {
      request = `${trip.request}\n\nAdditional details from the traveler: ${answers}`;
      intake = await parseIntake(request, {
        homeCity: user.homeCity,
        passportCountry: user.passportCountry,
      });
      await db.trip.update({
        where: { id: trip.id },
        data: {
          request,
          intake: JSON.stringify(intake),
          status: intake.complete ? "planning" : "intake",
        },
      });
    }

    if (!intake) {
      return NextResponse.json({ error: "Trip intake missing" }, { status: 400 });
    }
    if (!intake.complete) {
      return NextResponse.json(
        { needsInfo: true, followUpQuestions: intake.followUpQuestions },
        { status: 422 },
      );
    }

    await db.trip.update({ where: { id: trip.id }, data: { status: "planning" } });

    try {
      const plan = await generateTripPlan(intake, request);
      await savePlan(trip.id, plan);
      return NextResponse.json({ ok: true, tripId: trip.id });
    } catch (err) {
      await db.trip.update({ where: { id: trip.id }, data: { status: "failed" } });
      console.error("Plan generation failed:", err);
      return NextResponse.json(
        { error: describeAiError(err) ?? "Voyagoa couldn't finish this plan. Please try again." },
        { status: 502 },
      );
    }
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const aiMessage = describeAiError(err);
    if (aiMessage) return NextResponse.json({ error: aiMessage }, { status: 502 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
