import { Card } from "@/components/shared/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";

export type RouteSkeletonVariant =
  | "dashboard"
  | "list"
  | "rows"
  | "details"
  | "chat"
  | "form";

export interface RouteSkeletonProps {
  variant?: RouteSkeletonVariant;
  className?: string;
}

function HeaderSkeleton() {
  return (
    <>
      <Skeleton className="h-3 w-44" />
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2.5">
          <Skeleton className="h-8 w-64 max-w-full" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-10 w-36 rounded-full" />
      </div>
    </>
  );
}

function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      className={cn(
        "mt-8 grid grid-cols-2 gap-4",
        count > 3 ? "lg:grid-cols-4" : "sm:grid-cols-2"
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-16" />
            </div>
            <Skeleton className="h-11 w-11 rounded-xl" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="flex h-full flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="mt-4 h-4 w-3/4" />
          <Skeleton className="mt-2 h-3 w-1/2" />
          <div className="mt-auto pt-4">
            <Skeleton className="h-3 w-24" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function RowsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="mt-6 space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2.5">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-5 w-56 max-w-full" />
              <Skeleton className="h-3 w-72 max-w-full" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-9 w-28 rounded-full" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function ChatSkeleton() {
  return (
    <div className="mt-6 grid gap-4 overflow-hidden rounded-lg border border-border/70 md:grid-cols-[320px,1fr] md:gap-0">
      <div className="hidden flex-col gap-3 border-border/70 bg-card p-4 md:flex md:border-r">
        <Skeleton className="h-10 w-full rounded-full" />
        <div className="space-y-2 pt-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 p-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col bg-card">
        <div className="flex items-center gap-3 border-b border-border/70 p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex-1 space-y-3 bg-muted/30 p-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "flex",
                index % 2 === 0 ? "justify-start" : "justify-end"
              )}
            >
              <Skeleton
                className={cn(
                  "h-12 rounded-2xl",
                  index % 2 === 0 ? "w-56" : "w-44"
                )}
              />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 border-t border-border/70 p-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 flex-1 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function FormSkeleton() {
  return (
    <Card className="mt-8 p-6 sm:p-8">
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-full" />
          </div>
        ))}
        <div className="flex justify-end gap-3 border-t border-border/70 pt-6">
          <Skeleton className="h-10 w-20 rounded-full" />
          <Skeleton className="h-10 w-28 rounded-full" />
        </div>
      </div>
    </Card>
  );
}

function DetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2.5">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-8 w-72 max-w-full" />
          </div>
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
      </Card>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 sm:p-7 lg:col-span-2">
          <Skeleton className="h-5 w-32" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="mt-5 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-2/3" />
        </Card>
        <div className="space-y-6">
          <Card className="p-6">
            <Skeleton className="h-5 w-32" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function RouteSkeleton({ variant = "list", className }: RouteSkeletonProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8",
        className
      )}
      aria-busy="true"
      aria-live="polite"
    >
      <HeaderSkeleton />
      {variant === "dashboard" ? (
        <>
          <StatsSkeleton />
          <div className="mt-8 grid gap-6 xl:grid-cols-3">
            <div className="space-y-4 xl:col-span-2">
              <Skeleton className="h-5 w-36" />
              <CardGridSkeleton count={4} />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-5 w-32" />
              <Card className="p-5">
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-10 w-full rounded-xl" />
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </>
      ) : null}
      {variant === "list" ? <CardGridSkeleton /> : null}
      {variant === "rows" ? (
        <>
          <StatsSkeleton count={3} />
          <Skeleton className="mt-8 h-9 w-56 rounded-full" />
          <RowsSkeleton />
        </>
      ) : null}
      {variant === "details" ? <DetailsSkeleton /> : null}
      {variant === "chat" ? <ChatSkeleton /> : null}
      {variant === "form" ? <FormSkeleton /> : null}
    </div>
  );
}
