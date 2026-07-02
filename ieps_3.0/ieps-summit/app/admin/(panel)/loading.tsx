import { Skeleton, KpiCardsSkeleton, ChartsSkeleton } from "@/components/ui/Skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-7 w-40" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>
      <KpiCardsSkeleton />
      <ChartsSkeleton />
    </div>
  );
}
