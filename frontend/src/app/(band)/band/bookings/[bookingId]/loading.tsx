import { Card } from "@/components/shared/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="h-3 w-40" />
      <div className="mt-4 space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6 sm:p-7">
            <Skeleton className="h-5 w-36" />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          </Card>
          <Card className="p-6 sm:p-7">
            <Skeleton className="h-5 w-32" />
            <div className="mt-5 space-y-5">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex gap-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-10 flex-1" />
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="p-6">
            <Skeleton className="h-5 w-36" />
            <div className="mt-4 space-y-2.5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-6 w-28" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
