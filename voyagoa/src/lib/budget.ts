import type { TripPlan, TripSelections } from "@/lib/ai/schemas";

export type BudgetBreakdown = {
  currency: string;
  totalBudget: number;
  estimatedTotal: number;
  remaining: number;
  withinBudget: boolean;
  lines: Array<{
    key: "flights" | "accommodation" | "food" | "activities" | "localTransport" | "buffer";
    label: string;
    allocated: number;
    estimated: number;
  }>;
};

/**
 * Recomputes the live trip estimate from the current selections. Called every
 * time the user swaps a flight/hotel or removes an activity/restaurant, so the
 * budget tracker always reflects the actual configured trip.
 */
export function computeBudget(plan: TripPlan, selections: TripSelections): BudgetBreakdown {
  const travelers = Math.max(plan.travelers, 1);

  const flight = plan.flights.find((f) => f.id === selections.flightId) ?? plan.flights[0];
  const hotel = plan.hotels.find((h) => h.id === selections.hotelId) ?? plan.hotels[0];

  const flightsCost = (flight?.price ?? 0) * travelers;
  const hotelCost = hotel?.totalPrice ?? 0;

  const activeActivityIds = new Set(
    plan.activities
      .filter((a) => !selections.removedActivityIds.includes(a.id))
      .map((a) => a.id),
  );
  const activeRestaurantIds = new Set(
    plan.restaurants
      .filter((r) => !selections.removedRestaurantIds.includes(r.id))
      .map((r) => r.id),
  );

  // Cost what the itinerary actually schedules (skipping removed items),
  // not the whole recommendation pool.
  let activitiesCost = 0;
  let foodCost = 0;
  for (const day of plan.itinerary) {
    for (const e of day.entries) {
      if (e.refId && e.refId.startsWith("ac-") && !activeActivityIds.has(e.refId)) continue;
      if (e.refId && e.refId.startsWith("re-") && !activeRestaurantIds.has(e.refId)) continue;
      if (e.category === "activity") activitiesCost += e.estimatedCost * travelers;
      else if (e.category === "food") foodCost += e.estimatedCost * travelers;
    }
  }

  const transportCost = plan.budgetAllocation.localTransport;
  const buffer = plan.budgetAllocation.buffer;

  const lines: BudgetBreakdown["lines"] = [
    { key: "flights", label: "Flights", allocated: plan.budgetAllocation.flights, estimated: round2(flightsCost) },
    { key: "accommodation", label: "Hotels", allocated: plan.budgetAllocation.accommodation, estimated: round2(hotelCost) },
    { key: "food", label: "Food", allocated: plan.budgetAllocation.food, estimated: round2(foodCost) },
    { key: "activities", label: "Activities", allocated: plan.budgetAllocation.activities, estimated: round2(activitiesCost) },
    { key: "localTransport", label: "Local transport", allocated: plan.budgetAllocation.localTransport, estimated: round2(transportCost) },
    { key: "buffer", label: "Buffer", allocated: plan.budgetAllocation.buffer, estimated: round2(buffer) },
  ];

  const estimatedTotal = round2(lines.reduce((s, l) => s + l.estimated, 0));

  return {
    currency: plan.currency,
    totalBudget: plan.totalBudget,
    estimatedTotal,
    remaining: round2(plan.totalBudget - estimatedTotal),
    withinBudget: estimatedTotal <= plan.totalBudget,
    lines,
  };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount).toLocaleString()}`;
  }
}
