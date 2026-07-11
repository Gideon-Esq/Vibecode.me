import { NextRequest, NextResponse } from "next/server";
import { AuthError, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOwnedTrip, parsePlan, parseSelections, parseIntakeJson } from "@/lib/trips";
import { computeBudget } from "@/lib/budget";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const trip = await getOwnedTrip(id, user.id);
    if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

    const plan = parsePlan(trip);
    const selections = parseSelections(trip, plan);

    return NextResponse.json({
      trip: {
        id: trip.id,
        status: trip.status,
        title: trip.title,
        request: trip.request,
        shareToken: trip.shareToken,
        updatedAt: trip.updatedAt,
      },
      intake: parseIntakeJson(trip),
      plan,
      selections,
      budget: plan ? computeBudget(plan, selections) : null,
    });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const trip = await getOwnedTrip(id, user.id);
    if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

    await db.trip.delete({ where: { id: trip.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}

function handleError(err: unknown) {
  if (err instanceof AuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error(err);
  return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
}
