import { Card } from "@/components/shared/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardWidgetsSkeleton } from "@/band/components/skeletons";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="h-3 w-40" />
      <div className="mt-4 space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <Card className="mt-6 p-5 sm:p-6">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-3 h-3 w-72 max-w-full" />
        <Skeleton className="mt-4 h-12 w-full max-w-2xl rounded-full" />
      </Card>
      <div className="mt-8">
        <DashboardWidgetsSkeleton />
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-28 w-full rounded-lg" />
          <Skeleton className="h-28 w-full rounded-lg" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
