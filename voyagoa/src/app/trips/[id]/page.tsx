import { notFound, redirect } from "next/navigation";
import { Nav } from "@/components/nav";
import { Workspace } from "@/components/workspace";
import { PlanRunner } from "@/components/plan-runner";
import { getCurrentUser } from "@/lib/auth";
import { getOwnedTrip, parseIntakeJson, parsePlan, parseSelections } from "@/lib/trips";
import { computeBudget } from "@/lib/budget";

export default async function TripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const trip = await getOwnedTrip(id, user.id);
  if (!trip) notFound();

  const plan = parsePlan(trip);

  if (!plan) {
    const intake = parseIntakeJson(trip);
    return (
      <div className="flex min-h-screen flex-col">
        <Nav />
        <main className="flex flex-1 items-center px-4 py-16">
          <div className="w-full">
            <PlanRunner
              tripId={trip.id}
              status={trip.status}
              followUpQuestions={intake?.followUpQuestions ?? []}
            />
          </div>
        </main>
      </div>
    );
  }

  const selections = parseSelections(trip, plan);
  const budget = computeBudget(plan, selections);

  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="flex-1">
        <Workspace
          tripId={trip.id}
          initialPlan={plan}
          initialSelections={selections}
          initialBudget={budget}
          initialShareToken={trip.shareToken}
        />
      </main>
    </div>
  );
}
