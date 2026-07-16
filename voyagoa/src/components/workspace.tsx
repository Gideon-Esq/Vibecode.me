"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TripPlan, TripSelections } from "@/lib/ai/schemas";
import type { BudgetBreakdown } from "@/lib/budget";
import { formatMoney } from "@/lib/budget";
import { Badge, Button, Card, Spinner, cn } from "@/components/ui";
import { Icon } from "@/components/icon";
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

/** Sidebar glyph per section — mirrors the landing-page dashboard rail. */
const TAB_ICON: Record<Tab, string> = {
  Overview: "dashboard",
  Itinerary: "assignment",
  Flights: "flight",
  Hotels: "hotel",
  "Things to Do": "map",
  Food: "restaurant",
  Transport: "directions_bus",
  Visa: "verified",
  Budget: "account_balance_wallet",
};

const VISA_LABEL: Record<string, string> = {
  visa_free: "Visa-free entry",
  visa_on_arrival: "Visa on arrival",
  evisa: "eVisa required",
  visa_required: "Tourist visa required",
  unknown: "Check requirements",
};

/** Accent + glyph for each Overview budget tile, keyed by budget line. */
const OVERVIEW_TILES: Array<{
  key: "flights" | "accommodation" | "food" | "activities" | "localTransport";
  icon: string;
  tone: string;
}> = [
  { key: "flights", icon: "flight", tone: "text-blue bg-blue-soft" },
  { key: "accommodation", icon: "hotel", tone: "text-blue bg-blue-soft" },
  { key: "activities", icon: "sunny", tone: "text-yellow bg-yellow-soft" },
  { key: "food", icon: "restaurant", tone: "text-yellow bg-yellow-soft" },
  { key: "localTransport", icon: "directions_bus", tone: "text-teal bg-teal-soft" },
];

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

  const pct = Math.min(100, Math.round((budget.estimatedTotal / budget.totalBudget) * 100));
  const nights = Math.max(1, plan.days - 1);
  const tileNote: Record<string, string> = {
    flights: `${plan.flights.length} option${plan.flights.length === 1 ? "" : "s"}`,
    accommodation: `${nights} night${nights === 1 ? "" : "s"}`,
    activities: `${plan.activities.length} experiences`,
    food: `${plan.restaurants.length} places`,
    localTransport: `${plan.localTransport.length} options`,
  };

  return (
    <div className="mx-auto w-[min(100%-32px,1280px)] py-6">
      {/* Trip header + actions */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
            {plan.title}
          </h1>
          <p className="mt-0.5 text-xs text-ink-soft">
            {plan.startDate} → {plan.endDate} · {plan.days} days ·{" "}
            {plan.travelers} traveler{plan.travelers > 1 ? "s" : ""}
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
        <p className="mb-4 text-xs text-ink-faint">
          Anyone with the link can view this trip (read-only):{" "}
          <span className="font-mono">/share/{shareToken.slice(0, 8)}…</span>{" "}
          <button onClick={toggleShare} className="cursor-pointer text-blue-dark hover:underline">
            Turn off
          </button>
        </p>
      )}

      {/* Dashboard shell — sidebar nav + main panel */}
      <div className="grid overflow-hidden rounded-2xl border border-line bg-card shadow-[var(--shadow-soft)] lg:grid-cols-[210px_minmax(0,1fr)]">
        <aside className="flex gap-1 overflow-x-auto border-b border-line bg-paper-soft/50 p-3 lg:flex-col lg:overflow-visible lg:border-b-0 lg:border-r">
          <div className="mb-1 hidden gap-1.5 lg:flex">
            <button
              onClick={() => router.push("/trips")}
              aria-label="Back to trips"
              className="grid size-8 cursor-pointer place-items-center rounded-lg bg-white text-ink shadow-[0_6px_18px_rgba(10,22,51,0.09)] transition hover:text-blue"
            >
              <Icon name="chevron_left" className="text-sm" />
            </button>
            <span className="grid size-8 place-items-center rounded-lg bg-white text-ink-faint shadow-[0_6px_18px_rgba(10,22,51,0.09)]">
              <Icon name="search" className="text-sm" />
            </span>
          </div>
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex min-h-[34px] shrink-0 cursor-pointer items-center gap-2.5 whitespace-nowrap rounded-md px-3 text-[0.8rem] font-bold transition",
                tab === t ? "bg-blue text-white" : "text-ink-soft hover:bg-white hover:text-ink",
              )}
            >
              <Icon name={TAB_ICON[t]} className="text-[18px]" />
              {t}
            </button>
          ))}
        </aside>

        <div className="min-w-0 p-5 sm:p-7">
          {error && (
            <p className="mb-4 rounded-xl bg-blue/10 px-4 py-3 text-sm text-blue-dark">{error}</p>
          )}

          {tab === "Overview" ? (
            <div>
              <div className="mb-5">
                <strong className="block font-display text-lg font-semibold">
                  Your Trip to {plan.destinationCity}, {plan.destinationCountry}
                </strong>
                <span className="text-[0.82rem] text-ink-soft">
                  {plan.days} Days · Budget {formatMoney(plan.totalBudget, plan.currency)}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {/* Budget summary */}
                <article className="relative rounded-xl border border-line bg-card p-5 shadow-[0_8px_20px_rgba(10,22,51,0.05)] sm:col-span-2">
                  <span className="text-[0.78rem] text-ink-soft">Total Budget</span>
                  <strong className="mb-4 mt-1 block font-display text-[1.75rem]">
                    {formatMoney(plan.totalBudget, plan.currency)}
                  </strong>
                  <div className="mb-1.5 h-[6px] overflow-hidden rounded-full bg-[#dce7fb]">
                    <span
                      className={cn(
                        "block h-full rounded-full",
                        budget.withinBudget ? "bg-green" : "bg-blue",
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <small className={cn("font-semibold", budget.withinBudget ? "text-green" : "text-blue-dark")}>
                    {formatMoney(budget.estimatedTotal, budget.currency)} of{" "}
                    {formatMoney(budget.totalBudget, budget.currency)}
                  </small>
                  <div
                    className="absolute right-5 top-5 grid size-[76px] place-items-center rounded-full text-[0.86rem] font-black"
                    style={{
                      background: `radial-gradient(circle at center, var(--card) 0 55%, transparent 56%), conic-gradient(${
                        budget.withinBudget ? "var(--green)" : "var(--blue)"
                      } 0 ${pct}%, #d8e6f5 ${pct}% 100%)`,
                    }}
                  >
                    {pct}%
                  </div>
                </article>

                {/* Destination */}
                <article className="overflow-hidden rounded-xl border border-line bg-card shadow-[0_8px_20px_rgba(10,22,51,0.05)]">
                  <div className="flex h-[80px] items-end bg-[linear-gradient(135deg,rgba(17,103,241,0.92),rgba(34,184,199,0.85))] p-3">
                    <Icon name="location_on" className="text-[20px] text-white" />
                  </div>
                  <div className="p-3">
                    <strong className="mb-1 block text-[0.84rem]">
                      {plan.destinationCity}, {plan.destinationCountry}
                    </strong>
                    <p className="line-clamp-3 text-[0.68rem] leading-snug text-ink-soft">
                      {plan.destinationReason}
                    </p>
                  </div>
                </article>

                {/* Budget-category tiles */}
                {OVERVIEW_TILES.map((t) => {
                  const line = budget.lines.find((l) => l.key === t.key);
                  if (!line) return null;
                  return (
                    <article
                      key={t.key}
                      className="grid min-h-[88px] grid-cols-[42px_1fr] content-start gap-x-2.5 rounded-xl border border-line bg-card p-3.5 shadow-[0_8px_20px_rgba(10,22,51,0.05)]"
                    >
                      <span className={cn("row-span-3 grid size-9 place-items-center rounded-full", t.tone)}>
                        <Icon name={t.icon} className="text-[20px]" />
                      </span>
                      <strong className="text-[0.82rem]">{line.label}</strong>
                      <small className="text-[0.64rem] text-ink-soft">{tileNote[t.key]}</small>
                      <b className="text-[0.72rem] text-blue-dark">
                        {formatMoney(line.estimated, budget.currency)}
                      </b>
                    </article>
                  );
                })}

                {/* Visa tile */}
                <button
                  type="button"
                  onClick={() => setTab("Visa")}
                  className="grid min-h-[88px] cursor-pointer grid-cols-[42px_1fr] content-start gap-x-2.5 rounded-xl border border-line bg-card p-3.5 text-left shadow-[0_8px_20px_rgba(10,22,51,0.05)] transition hover:border-blue/40"
                >
                  <span className="row-span-3 grid size-9 place-items-center rounded-full bg-purple-soft text-purple">
                    <Icon name="verified_user" className="text-[20px]" />
                  </span>
                  <strong className="text-[0.82rem]">Visa Guidance</strong>
                  <small className="text-[0.64rem] text-ink-soft">
                    {VISA_LABEL[plan.visa.requirement] ?? "Check requirements"}
                  </small>
                  <b className="text-[0.72rem] text-blue-dark">See details</b>
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between gap-4">
                <span className="text-[0.74rem] text-ink-soft">Next: Review your itinerary</span>
                <button
                  type="button"
                  onClick={() => setTab("Itinerary")}
                  className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-lg bg-blue px-5 text-[0.84rem] font-extrabold text-white transition hover:-translate-y-px hover:bg-blue-dark"
                >
                  View Itinerary
                  <Icon name="arrow_forward" className="text-[17px]" />
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
              <div className="min-w-0 space-y-4">

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
          )}
        </div>
      </div>
    </div>
  );
}
