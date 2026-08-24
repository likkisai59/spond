import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/shared/card";
import { cn } from "@/utils/cn";

export function MarketplaceCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("flex h-full flex-col p-5 sm:p-6", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-2/3" />
      <div className="mt-auto flex items-center justify-between border-t border-border/70 pt-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-9 w-28 rounded-full" />
      </div>
    </Card>
  );
}

export function BookingCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("p-5 sm:p-6", className)}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2.5">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-5 w-52" />
          <Skeleton className="h-3 w-72 max-w-full" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
      </div>
    </Card>
  );
}

export function ReviewCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("flex h-full flex-col p-5 sm:p-6", className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="mt-4 h-3 w-24" />
      <Skeleton className="mt-3 h-4 w-3/4" />
      <Skeleton className="mt-2 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-5/6" />
    </Card>
  );
}

export function DashboardWidgetsSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-11 w-11 rounded-xl" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function ProfileDetailsSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      <Card className="overflow-hidden">
        <Skeleton className="h-28 w-full rounded-none sm:h-36" />
        <div className="px-6 pb-6 sm:px-8">
          <div className="-mt-10 flex items-end gap-4">
            <Skeleton className="h-24 w-24 rounded-3xl sm:h-28 sm:w-28" />
            <div className="space-y-2.5 pb-2">
              <Skeleton className="h-7 w-44" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-28" />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </Card>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-4 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-11/12" />
          <Skeleton className="mt-2 h-3 w-4/5" />
        </Card>
        <Card className="p-6">
          <Skeleton className="h-5 w-28" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
