import { startOfDay, subDays, eachDayOfInterval, format } from "date-fns";
import { prisma } from "@/lib/db";
import { roleLabel, LEVELS } from "@/lib/registration";

export type ChartDatum = { name: string; value: number };

export type Analytics = {
  kpis: {
    totalRegistrations: number;
    confirmed: number;
    attended: number;
    certificatesIssued: number;
    todayRegistrations: number;
    yesterdayRegistrations: number;
  };
  registrationsOverTime: { date: string; count: number }[];
  roleBreakdown: ChartDatum[];
  institutions: ChartDatum[];
  sessions: ChartDatum[];
  gender: ChartDatum[];
  heardAbout: ChartDatum[];
  levels: ChartDatum[];
};

type GroupRow = Record<string, unknown> & { _count: number };

function tally(rows: GroupRow[], key: string): ChartDatum[] {
  return rows
    .map((r) => ({ name: String(r[key] ?? "—"), value: r._count }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Computes every KPI and chart dataset in a single call. Used by both the
 * /api/admin/analytics route and the dashboard server component.
 */
export async function getAnalytics(now: Date = new Date()): Promise<Analytics> {
  const todayStart = startOfDay(now);
  const yesterdayStart = subDays(todayStart, 1);
  const windowStart = subDays(todayStart, 29); // 30-day window incl. today

  const [
    totalRegistrations,
    confirmed,
    attended,
    certificatesIssued,
    todayRegistrations,
    yesterdayRegistrations,
    byRole,
    byInstitution,
    byGender,
    byHeard,
    bySession,
    byLevel,
    recent,
  ] = await Promise.all([
    prisma.registration.count(),
    prisma.registration.count({ where: { status: "CONFIRMED" } }),
    prisma.registration.count({ where: { attended: true } }),
    prisma.registration.count({ where: { NOT: { certificateUrl: null } } }),
    prisma.registration.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.registration.count({
      where: { createdAt: { gte: yesterdayStart, lt: todayStart } },
    }),
    prisma.registration.groupBy({ by: ["role"], _count: true }),
    prisma.registration.groupBy({ by: ["institution"], _count: true }),
    prisma.registration.groupBy({ by: ["gender"], _count: true }),
    prisma.registration.groupBy({ by: ["heardAboutUs"], _count: true }),
    prisma.sessionInterest.groupBy({ by: ["sessionName"], _count: true }),
    prisma.registration.groupBy({ by: ["level"], _count: true }),
    prisma.registration.findMany({
      where: { createdAt: { gte: windowStart } },
      select: { createdAt: true },
    }),
  ]);

  // Registrations over the last 30 days (zero-filled).
  const buckets = new Map<string, number>();
  for (const day of eachDayOfInterval({ start: windowStart, end: todayStart })) {
    buckets.set(format(day, "yyyy-MM-dd"), 0);
  }
  for (const r of recent) {
    const key = format(r.createdAt, "yyyy-MM-dd");
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  const registrationsOverTime = Array.from(buckets.entries()).map(
    ([day, count]) => ({ date: format(new Date(day), "MMM d"), count })
  );

  return {
    kpis: {
      totalRegistrations,
      confirmed,
      attended,
      certificatesIssued,
      todayRegistrations,
      yesterdayRegistrations,
    },
    registrationsOverTime,
    roleBreakdown: tally(byRole as unknown as GroupRow[], "role").map((d) => ({
      name: roleLabel(d.name),
      value: d.value,
    })),
    institutions: tally(byInstitution as unknown as GroupRow[], "institution").slice(0, 10),
    gender: tally(byGender as unknown as GroupRow[], "gender"),
    heardAbout: tally(byHeard as unknown as GroupRow[], "heardAboutUs"),
    sessions: tally(bySession as unknown as GroupRow[], "sessionName"),
    // Levels (incl. Postgraduate) sorted by study progression, not by count.
    levels: tally(byLevel as unknown as GroupRow[], "level").sort((a, b) => {
      const ia = LEVELS.indexOf(a.name as (typeof LEVELS)[number]);
      const ib = LEVELS.indexOf(b.name as (typeof LEVELS)[number]);
      return (ia === -1 ? LEVELS.length : ia) - (ib === -1 ? LEVELS.length : ib);
    }),
  };
}
