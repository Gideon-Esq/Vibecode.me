import { getAnalytics } from "@/lib/analytics";
import { KpiCards } from "@/components/admin/KpiCards";
import { DashboardCharts } from "@/components/admin/DashboardCharts";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const analytics = await getAnalytics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">Analytics</h1>
        <p className="text-sm text-ink/60">
          Registration trends and attendee breakdowns.
        </p>
      </div>
      <KpiCards kpis={analytics.kpis} />
      <DashboardCharts data={analytics} />
    </div>
  );
}
