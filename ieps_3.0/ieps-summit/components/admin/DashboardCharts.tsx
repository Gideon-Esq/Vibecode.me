"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import type { ReactNode } from "react";
import type { Analytics, ChartDatum } from "@/lib/analytics";

/* Categorical palette for analytics — navy-led to stay on brand, then a set of
   distinct, accessible hues so adjacent slices/bars are easy to tell apart. */
const PALETTE = [
  "#0D1B5E", // brand navy (lead)
  "#F5C400", // brand gold
  "#2563C9", // blue
  "#E2603B", // coral
  "#7C5CBF", // violet
  "#14A8A0", // teal
  "#C2417F", // magenta
  "#8FB339", // lime
];

const NAVY = "#0D1B5E";
const GOLD = "#FFD740"; // bright gold accent — used on the dark navy line chart

function ChartCard({
  title,
  subtitle,
  children,
  dark = false,
  empty = false,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  dark?: boolean;
  empty?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-card ${
        dark ? "border-white/10 bg-navy text-white" : "border-navy/10 bg-white"
      }`}
    >
      <h3 className={`font-display text-base font-bold ${dark ? "text-white" : "text-navy"}`}>
        {title}
      </h3>
      {subtitle && (
        <p className={`text-xs ${dark ? "text-white/55" : "text-ink/50"}`}>
          {subtitle}
        </p>
      )}
      <div className="mt-4 h-[260px]">
        {empty ? (
          <div className="flex h-full items-center justify-center text-sm text-ink/40">
            No data yet
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid rgba(13,27,94,0.12)",
  fontSize: 13,
  boxShadow: "0 8px 30px rgba(13,27,94,0.15)",
};

function isEmpty(data: ChartDatum[]) {
  return data.length === 0 || data.every((d) => d.value === 0);
}

export function DashboardCharts({ data }: { data: Analytics }) {
  const lineEmpty = data.registrationsOverTime.every((d) => d.count === 0);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Registrations over time — full width */}
      <div className="lg:col-span-2">
        <ChartCard
          title="Registrations Over Time"
          subtitle="Daily new registrations, last 30 days"
          dark
          empty={lineEmpty}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.registrationsOverTime} margin={{ left: -18, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="date"
                tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis allowDecimals={false} tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ ...tooltipStyle, backgroundColor: "#fff", color: NAVY }}
                cursor={{ stroke: GOLD, strokeWidth: 1 }}
              />
              <Line
                type="monotone"
                dataKey="count"
                name="Registrations"
                stroke={GOLD}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: GOLD }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Role breakdown — donut */}
      <ChartCard title="Role Breakdown" subtitle="Attendees by role" empty={isEmpty(data.roleBreakdown)}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.roleBreakdown}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
            >
              {data.roleBreakdown.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Gender split — pie */}
      <ChartCard title="Gender Split" empty={isEmpty(data.gender)}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.gender}
              dataKey="value"
              nameKey="name"
              outerRadius={90}
              label={(props) => `${props.name}`}
            >
              {data.gender.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Institution distribution — horizontal bars */}
      <ChartCard
        title="Top Institutions"
        subtitle="By registrant count"
        empty={isEmpty(data.institutions)}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.institutions} layout="vertical" margin={{ left: 12, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(13,27,94,0.08)" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="name"
              width={120}
              tick={{ fontSize: 10, fill: NAVY }}
              tickFormatter={(v: string) => (v.length > 18 ? `${v.slice(0, 18)}…` : v)}
            />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(13,27,94,0.08)" }} />
            <Bar dataKey="value" name="Registrants" radius={[0, 6, 6, 0]}>
              {data.institutions.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Session interest — horizontal bars */}
      <ChartCard
        title="Session Interest"
        subtitle="Most-requested sessions"
        empty={isEmpty(data.sessions)}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.sessions} layout="vertical" margin={{ left: 12, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(13,27,94,0.08)" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="name"
              width={120}
              tick={{ fontSize: 10, fill: NAVY }}
              tickFormatter={(v: string) => (v.length > 18 ? `${v.slice(0, 18)}…` : v)}
            />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(13,27,94,0.08)" }} />
            <Bar dataKey="value" name="Interested" radius={[0, 6, 6, 0]}>
              {data.sessions.map((_, i) => (
                <Cell key={i} fill={PALETTE[(i + 2) % PALETTE.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Level of study — vertical bars (100L → Postgraduate) */}
      <ChartCard
        title="Level of Study"
        subtitle="Registrants by level, incl. postgraduate"
        empty={isEmpty(data.levels)}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.levels} margin={{ left: -18, right: 8, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(13,27,94,0.08)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: NAVY }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(13,27,94,0.08)" }} />
            <Bar dataKey="value" name="Registrants" radius={[6, 6, 0, 0]}>
              {data.levels.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* How did you hear — pie */}
      <ChartCard title="How Did You Hear?" empty={isEmpty(data.heardAbout)}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.heardAbout}
              dataKey="value"
              nameKey="name"
              innerRadius={45}
              outerRadius={90}
              paddingAngle={2}
            >
              {data.heardAbout.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
