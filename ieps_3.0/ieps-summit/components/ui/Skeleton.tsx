import { cn } from "@/lib/utils";

/** Base shimmering skeleton block (navy-tinted). */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-navy/10",
        className
      )}
      aria-hidden
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent" />
    </div>
  );
}

/** Skeleton for the admin KPI card row. */
export function KpiCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-navy/10 bg-white p-5 shadow-card">
          <div className="flex items-start justify-between">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="mt-4 h-8 w-24" />
          <Skeleton className="mt-2 h-4 w-32" />
        </div>
      ))}
    </div>
  );
}

/** Skeleton grid standing in for the dashboard charts. */
export function ChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="lg:col-span-2">
        <div className="rounded-2xl border border-navy/10 bg-white p-5 shadow-card">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="mt-4 h-[260px] w-full rounded-xl" />
        </div>
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-navy/10 bg-white p-5 shadow-card">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-4 h-[260px] w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

/** Skeleton rows for the registrations table. */
export function RegistrationsTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-card">
      <div className="border-b border-navy/10 bg-offwhite px-4 py-3">
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="divide-y divide-navy/5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="hidden h-4 w-44 sm:block" />
            <Skeleton className="hidden h-4 w-28 md:block" />
            <Skeleton className="ml-auto h-6 w-20 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
