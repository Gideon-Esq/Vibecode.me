import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { parsePlan, parseSelections } from "@/lib/trips";
import { computeBudget, formatMoney } from "@/lib/budget";
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

export const metadata = { title: "Shared trip — Voyagoa" };

export default async function SharedTripPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const trip = await db.trip.findUnique({ where: { shareToken: token } });
  if (!trip) notFound();

  const plan = parsePlan(trip);
  if (!plan) notFound();

  const selections = parseSelections(trip, plan);
  const budget = computeBudget(plan, selections);

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-paper/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <span className="font-display text-xl font-semibold">Voyagoa</span>
          <Link
            href="/"
            className="rounded-full bg-blue px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-dark"
          >
            Plan your own trip
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="border-b border-line py-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-dark">
            Shared itinerary · {plan.startDate} → {plan.endDate} · {plan.days} days
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {plan.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">{plan.summary}</p>
          <p className="mt-2 text-sm text-ink-faint">
            Total budget: {formatMoney(plan.totalBudget, plan.currency)} for {plan.travelers}{" "}
            traveler{plan.travelers > 1 ? "s" : ""}
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0 space-y-10">
            <Section title="Day-by-day itinerary">
              {plan.itinerary.map((day) => (
                <ItineraryDayView key={day.day} day={day} currency={plan.currency} />
              ))}
            </Section>

            <Section title="Flights">
              {plan.flights.map((f) => (
                <FlightCard
                  key={f.id}
                  flight={f}
                  currency={plan.currency}
                  selected={selections.flightId === f.id}
                />
              ))}
            </Section>

            <Section title="Hotels">
              {plan.hotels.map((h) => (
                <HotelCard
                  key={h.id}
                  hotel={h}
                  currency={plan.currency}
                  selected={selections.hotelId === h.id}
                />
              ))}
            </Section>

            <Section title="Things to do">
              {plan.activities
                .filter((a) => !selections.removedActivityIds.includes(a.id))
                .map((a) => (
                  <ActivityCard key={a.id} activity={a} currency={plan.currency} />
                ))}
            </Section>

            <Section title="Food">
              {plan.restaurants
                .filter((r) => !selections.removedRestaurantIds.includes(r.id))
                .map((r) => (
                  <RestaurantCard key={r.id} restaurant={r} currency={plan.currency} />
                ))}
            </Section>

            <Section title="Getting around">
              {plan.localTransport.map((t) => (
                <TransportCard key={t.id} option={t} />
              ))}
            </Section>

            <Section title="Visa guidance">
              <VisaPanel visa={plan.visa} />
            </Section>
          </div>

          <aside>
            <BudgetTracker budget={budget} />
          </aside>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 font-display text-xl font-semibold">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
