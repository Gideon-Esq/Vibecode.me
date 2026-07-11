import Link from "next/link";
import { redirect } from "next/navigation";
import { Nav } from "@/components/nav";
import { Badge } from "@/components/ui";
import { Icon } from "@/components/icon";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/budget";

export const metadata = { title: "My trips — Voyagoa" };

const STATUS_LABEL: Record<string, { label: string; tone: "sea" | "sand" | "coral" | "neutral" }> = {
  ready: { label: "Ready", tone: "sea" },
  planning: { label: "Planning", tone: "sand" },
  intake: { label: "Needs details", tone: "sand" },
  failed: { label: "Failed", tone: "coral" },
};

export default async function TripsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const trips = await db.trip.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-semibold">My trips</h1>
          <Link
            href="/"
            className="rounded-full bg-coral px-5 py-2.5 text-sm font-medium text-white transition hover:bg-coral-deep"
          >
            + Plan a new trip
          </Link>
        </div>

        {trips.length === 0 ? (
          <div className="mt-16 text-center">
            <Icon name="explore" className="text-5xl text-ink-faint" />
            <p className="mt-4 font-display text-xl">No journeys yet</p>
            <p className="mt-2 text-sm text-ink-soft">
              Tell Voyagoa your budget and days — it plans the rest.
            </p>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {trips.map((trip) => {
              const status = STATUS_LABEL[trip.status] ?? STATUS_LABEL.intake;
              return (
                <li key={trip.id}>
                  <Link
                    href={`/trips/${trip.id}`}
                    className="block rounded-2xl border border-line bg-card p-5 transition hover:border-ink-faint hover:shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-display text-lg font-semibold">{trip.title}</p>
                        <p className="mt-0.5 text-sm text-ink-soft">
                          {trip.destinationCity
                            ? `${trip.destinationCity}${trip.destinationCountry ? ", " + trip.destinationCountry : ""}`
                            : "Destination pending"}
                          {trip.startDate && ` · ${trip.startDate}`}
                          {trip.days && ` · ${trip.days} days`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {trip.totalBudget != null && (
                          <span className="text-sm font-medium tabular-nums">
                            {formatMoney(trip.totalBudget, trip.currency)}
                          </span>
                        )}
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
