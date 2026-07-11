import "server-only";
import { db } from "@/lib/db";
import {
  TripPlanSchema,
  defaultSelections,
  type TripIntake,
  type TripPlan,
  type TripSelections,
} from "@/lib/ai/schemas";

export type TripRecord = NonNullable<Awaited<ReturnType<typeof db.trip.findUnique>>>;

export function parsePlan(trip: { plan: string | null }): TripPlan | null {
  if (!trip.plan) return null;
  const parsed = TripPlanSchema.safeParse(JSON.parse(trip.plan));
  return parsed.success ? parsed.data : null;
}

export function parseSelections(trip: { selections: string | null }, plan: TripPlan | null): TripSelections {
  if (trip.selections) {
    try {
      return JSON.parse(trip.selections) as TripSelections;
    } catch {
      /* fall through */
    }
  }
  return plan
    ? defaultSelections(plan)
    : { flightId: null, hotelId: null, removedActivityIds: [], removedRestaurantIds: [] };
}

export function parseIntakeJson(trip: { intake: string | null }): TripIntake | null {
  if (!trip.intake) return null;
  try {
    return JSON.parse(trip.intake) as TripIntake;
  } catch {
    return null;
  }
}

export async function savePlan(tripId: string, plan: TripPlan) {
  await db.trip.update({
    where: { id: tripId },
    data: {
      status: "ready",
      title: plan.title,
      destinationCity: plan.destinationCity,
      destinationCountry: plan.destinationCountry,
      startDate: plan.startDate,
      endDate: plan.endDate,
      days: plan.days,
      travelers: plan.travelers,
      currency: plan.currency,
      totalBudget: plan.totalBudget,
      plan: JSON.stringify(plan),
      selections: JSON.stringify(defaultSelections(plan)),
    },
  });
}

export async function getOwnedTrip(tripId: string, userId: string) {
  const trip = await db.trip.findUnique({ where: { id: tripId } });
  if (!trip || trip.userId !== userId) return null;
  return trip;
}
