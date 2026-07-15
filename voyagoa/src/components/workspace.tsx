"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TripPlan, TripSelections } from "@/lib/ai/schemas";
import type { BudgetBreakdown } from "@/lib/budget";
import { formatMoney } from "@/lib/budget";
import { Badge, Button, Card, Spinner, cn } from "@/components/ui";
import {
  ActivityCard,
  BudgetTracker,
  FlightCard,
  HotelCard,
  ItineraryDayView,
  RestaurantCard,
  TransportCard,
  VisaPanel,
} from "@/components/plan/sections";

const TABS = [
  "Overview",
  "Itinerary",
  "Flights",
  "Hotels",
  "Things to Do",
  "Food",
  "Transport",
  "Visa",
  "Budget",
] as const;
type Tab = (typeof TABS)[number];

export function Workspace({
  tripId,
  initialPlan,
  initialSelections,
  initialBudget,
  initialShareToken,
}: {
  tripId: string;
  initialPlan: TripPlan;
  initialSelections: TripSelections;
  initialBudget: BudgetBreakdown;
  initialShareToken: string | null;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Overview");
  const [plan, setPlan] = useState(initialPlan);
  const [selections, setSelections] = useState(initialSelections);
  const [budget, setBudget] = useState(initialBudget);
  const [shareToken, setShareToken] = useState(initialShareToken);
  const [regeneratingDay, setRegeneratingDay] = useState<number | null>(null);
  const [shareBusy, setShareBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function applySelection(body: Record<string, string>) {
    setError(null);
    const res = await fetch(`/api/trips/${tripId}/select`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      setError("Couldn't update the trip — try again.");
      return;
    }
    const data = await res.json();
    setSelections(data.selections);
    setBudget(data.budget);
  }

  async function regenerateDay(day: number, instructions?: string) {
    setError(null);
    setRegeneratingDay(day);
    try {
      const res = await fetch(`/api/trips/${tripId}/regenerate-day`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ day, instructions }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Couldn't regenerate that day.");
        return;
      }
      const data = await res.json();
      setPlan((p) => ({
        ...p,
        itinerary: p.itinerary.map((d) => (d.day === data.day.day ? data.day : d)),
      }));
    } finally {
      setRegeneratingDay(null);
    }
  }

  async function toggleShare() {
    setShareBusy(true);
    try {
      if (shareToken) {
        await fetch(`/api/trips/${tripId}/share`, { method: "DELETE" });
        setShareToken(null);
      } else {
        const res = await fetch(`/api/trips/${tripId}/share`, { method: "POST" });
        const data = await res.json();
        setShareToken(data.shareToken);
      }
    } finally {
      setShareBusy(false);
    }
  }

  async function copyShareLink() {
    if (!shareToken) return;
    await navigator.clipboard.writeText(`${window.location.origin}/share/${shareToken}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function deleteTrip() {
    if (!confirm("Delete this trip? This can't be undone.")) return;
    await fetch(`/api/trips/${tripId}`, { method: "DELETE" });
    router.push("/trips");
    router.refresh();
  }

  const selectedFlight = plan.flights.find((f) => f.id === selections.flightId);
  const selectedHotel = plan.hotels.find((h) => h.id === selections.hotelId);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      {/* Trip header */}
      <div className="border-b border-line py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-dark">
              {plan.startDate} → {plan.endDate} · {plan.days} days ·{" "}
              {plan.travelers} traveler{plan.travelers > 1 ? "s" : ""}
            </p>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {plan.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
              {plan.summary}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={toggleShare} disabled={shareBusy}>
              {shareBusy ? <Spinner /> : shareToken ? "Sharing on" : "Share trip"}
            </Button>
            {shareToken && (
              <Button variant="secondary" onClick={copyShareLink}>
                {copied ? "Copied!" : "Copy link"}
              </Button>
            )}
            <Button variant="danger" onClick={deleteTrip} aria-label="Delete trip">
              Delete
            </Button>
          </div>
        </div>
        {shareToken && (
          <p className="mt-3 text-xs text-ink-faint">
            Anyone with the link can view this trip (read-only):{" "}
            <span className="font-mono">/share/{shareToken.slice(0, 8)}…</span>{" "}
            <button onClick={toggleShare} className="cursor-pointer text-blue-dark hover:underline">
              Turn off
            </button>
          </p>
        )}
      </div>

      {/* Tabs */}
      <nav className="sticky top-16 z-30 -mx-4 overflow-x-auto border-b border-line bg-paper/90 px-4 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex gap-1 py-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "cursor-pointer whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition",
                tab === t
                  ? "bg-ink text-paper"
                  : "text-ink-soft hover:bg-paper-soft hover:text-ink",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </nav>

      {error && (
        <p className="mt-4 rounded-xl bg-blue/10 px-4 py-3 text-sm text-blue-dark">{error}</p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-4">
          {tab === "Overview" && (
            <div className="space-y-4">
              <Card>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                  Why {plan.destinationCity}?
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {plan.destinationReason}
                </p>
              </Card>
              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                    Your flight
                  </h3>
                  {selectedFlight ? (
                    <>
                      <p className="mt-2 font-medium">{selectedFlight.airline}</p>
                      <p className="text-sm text-ink-soft">{selectedFlight.route}</p>
                      <p className="mt-1 font-display text-lg">
                        {formatMoney(selectedFlight.price * plan.travelers, plan.currency)}
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-ink-faint">Pick one in the Flights tab</p>
                  )}
                </Card>
                <Card>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                    Your stay
                  </h3>
                  {selectedHotel ? (
                    <>
                      <p className="mt-2 font-medium">{selectedHotel.name}</p>
                      <p className="text-sm text-ink-soft">{selectedHotel.area}</p>
                      <p className="mt-1 font-display text-lg">
                        {formatMoney(selectedHotel.totalPrice, plan.currency)}
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-ink-faint">Pick one in the Hotels tab</p>
                  )}
                </Card>
              </div>
              <Card>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                  Good to know
                </h3>
                <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm text-ink-soft">
                  {plan.tips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </Card>
            </div>
          )}

          {tab === "Itinerary" &&
            plan.itinerary.map((day) => (
              <ItineraryDayView
                key={day.day}
                day={day}
                currency={plan.currency}
                regenerating={regeneratingDay === day.day}
                onRegenerate={() => {
                  const instructions =
                    prompt(
                      `Regenerate day ${day.day}. Any preferences? (leave blank for a fresh take)`,
                    ) ?? undefined;
                  regenerateDay(day.day, instructions?.trim() || undefined);
                }}
              />
            ))}

          {tab === "Flights" &&
            plan.flights.map((f) => (
              <FlightCard
                key={f.id}
                flight={f}
                currency={plan.currency}
                selected={selections.flightId === f.id}
                onSelect={() => applySelection({ flightId: f.id })}
              />
            ))}

          {tab === "Hotels" &&
            plan.hotels.map((h) => (
              <HotelCard
                key={h.id}
                hotel={h}
                currency={plan.currency}
                selected={selections.hotelId === h.id}
                onSelect={() => applySelection({ hotelId: h.id })}
              />
            ))}

          {tab === "Things to Do" &&
            plan.activities.map((a) => (
              <ActivityCard
                key={a.id}
                activity={a}
                currency={plan.currency}
                removed={selections.removedActivityIds.includes(a.id)}
                onToggle={() => applySelection({ toggleActivityId: a.id })}
              />
            ))}

          {tab === "Food" &&
            plan.restaurants.map((r) => (
              <RestaurantCard
                key={r.id}
                restaurant={r}
                currency={plan.currency}
                removed={selections.removedRestaurantIds.includes(r.id)}
                onToggle={() => applySelection({ toggleRestaurantId: r.id })}
              />
            ))}

          {tab === "Transport" &&
            plan.localTransport.map((t) => <TransportCard key={t.id} option={t} />)}

          {tab === "Visa" && <VisaPanel visa={plan.visa} />}

          {tab === "Budget" && (
            <div className="space-y-4">
              <Card>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                  How Voyagoa allocated your {formatMoney(plan.totalBudget, plan.currency)}
                </h3>
                <div className="mt-4 space-y-3">
                  {budget.lines.map((line) => {
                    const pct = Math.min(
                      100,
                      Math.round((line.estimated / Math.max(line.allocated, 1)) * 100),
                    );
                    return (
                      <div key={line.key}>
                        <div className="flex justify-between text-sm">
                          <span>{line.label}</span>
                          <span className="tabular-nums text-ink-soft">
                            {formatMoney(line.estimated, plan.currency)} /{" "}
                            {formatMoney(line.allocated, plan.currency)}
                          </span>
                        </div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-paper-soft">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              line.estimated > line.allocated ? "bg-blue" : "bg-green",
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-4 text-xs text-ink-faint">
                  Estimates recalculate automatically when you change flights, hotels, or
                  remove activities and restaurants.
                </p>
              </Card>
            </div>
          )}
        </div>

        {/* Persistent budget rail */}
        <aside className="order-first lg:order-none">
          <BudgetTracker budget={budget} />
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-ink-faint">
            <Badge tone="green"><span className="size-1.5 rounded-full bg-green" aria-hidden />live data</Badge>
            <span>verified</span>
            <Badge tone="yellow"><span className="size-1.5 rounded-full border border-current" aria-hidden />AI estimate</Badge>
            <span>verify before booking</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
