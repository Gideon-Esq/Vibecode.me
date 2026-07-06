import {
  Users,
  BadgeCheck,
  Award,
  CalendarPlus,
  GraduationCap,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Analytics } from "@/lib/analytics";

type Trend = { dir: "up" | "down" | "flat"; label: string };

function Card({
  icon: Icon,
  label,
  value,
  accent,
  trend,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  accent: string;
  trend?: Trend;
}) {
  const TrendIcon =
    trend?.dir === "up" ? ArrowUp : trend?.dir === "down" ? ArrowDown : Minus;
  const trendColor =
    trend?.dir === "up"
      ? "text-green"
      : trend?.dir === "down"
        ? "text-red-500"
        : "text-ink/40";

  return (
    <div className="card-hover overflow-hidden rounded-2xl border border-navy/10 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between">
        <span
          className="grid h-11 w-11 place-items-center rounded-xl"
          style={{ backgroundColor: `${accent}1A`, color: accent }}
        >
          <Icon className="h-6 w-6" />
        </span>
        {trend && (
          <span className={`inline-flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
            <TrendIcon className="h-3.5 w-3.5" />
            {trend.label}
          </span>
        )}
      </div>
      <p className="mt-4 font-display text-3xl font-bold text-navy">
        {value.toLocaleString()}
      </p>
      <p className="mt-1 text-sm text-ink/60">{label}</p>
    </div>
  );
}

export function KpiCards({ kpis }: { kpis: Analytics["kpis"] }) {
  const delta = kpis.todayRegistrations - kpis.yesterdayRegistrations;
  const todayTrend: Trend = {
    dir: delta > 0 ? "up" : delta < 0 ? "down" : "flat",
    label: `${delta >= 0 ? "+" : ""}${delta} vs yesterday`,
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <Card
        icon={Users}
        label="Total Registrations"
        value={kpis.totalRegistrations}
        accent="#0D1B5E"
        trend={{
          dir: kpis.todayRegistrations > 0 ? "up" : "flat",
          label: `+${kpis.todayRegistrations} today`,
        }}
      />
      <Card
        icon={BadgeCheck}
        label="Confirmed Attendees"
        value={kpis.confirmed}
        accent="#806600"
      />
      <Card
        icon={Award}
        label="Certificates Issued"
        value={kpis.certificatesIssued}
        accent="#1A2D8A"
      />
      <Card
        icon={CalendarPlus}
        label="Today's New Registrations"
        value={kpis.todayRegistrations}
        accent="#C49B00"
        trend={todayTrend}
      />
      <Card
        icon={GraduationCap}
        label="Faculty of Education"
        value={kpis.facultyOfEducation}
        accent="#017E33"
      />
    </div>
  );
}
