import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AuthError, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOwnedTrip, parsePlan, parseSelections } from "@/lib/trips";
import { computeBudget } from "@/lib/budget";

const bodySchema = z.object({
  flightId: z.string().optional(),
  hotelId: z.string().optional(),
  toggleActivityId: z.string().optional(),
  toggleRestaurantId: z.string().optional(),
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

    const plan = parsePlan(trip);
    if (!plan) return NextResponse.json({ error: "Trip has no plan yet" }, { status: 400 });

    const body = bodySchema.safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const selections = parseSelections(trip, plan);

    if (body.data.flightId && plan.flights.some((f) => f.id === body.data.flightId)) {
      selections.flightId = body.data.flightId;
    }
    if (body.data.hotelId && plan.hotels.some((h) => h.id === body.data.hotelId)) {
      selections.hotelId = body.data.hotelId;
    }
    if (body.data.toggleActivityId) {
      const aid = body.data.toggleActivityId;
      selections.removedActivityIds = selections.removedActivityIds.includes(aid)
        ? selections.removedActivityIds.filter((x) => x !== aid)
        : [...selections.removedActivityIds, aid];
    }
    if (body.data.toggleRestaurantId) {
      const rid = body.data.toggleRestaurantId;
      selections.removedRestaurantIds = selections.removedRestaurantIds.includes(rid)
        ? selections.removedRestaurantIds.filter((x) => x !== rid)
        : [...selections.removedRestaurantIds, rid];
    }

    await db.trip.update({
      where: { id: trip.id },
      data: { selections: JSON.stringify(selections) },
    });

    return NextResponse.json({ selections, budget: computeBudget(plan, selections) });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
