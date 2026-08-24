import { Star } from "lucide-react";
import { Card } from "@/components/shared/card";
import { cn } from "@/utils/cn";

export interface ReviewSummaryProps {
  ratings: number[];
  className?: string;
}

export function ReviewSummary({ ratings, className }: ReviewSummaryProps) {
  const total = ratings.length;
  const average = total > 0 ? ratings.reduce((sum, r) => sum + r, 0) / total : 0;
  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: ratings.filter((r) => r === stars).length,
  }));

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div className="shrink-0 text-center">
          <p className="text-4xl font-extrabold tracking-tight">
            {average.toFixed(1)}
          </p>
          <div className="mt-1.5 flex justify-center">
            <span className="inline-flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "h-3.5 w-3.5",
                    star <= Math.round(average)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-muted text-muted"
                  )}
                />
              ))}
            </span>
          </div>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">
            {total} review{total === 1 ? "" : "s"}
          </p>
        </div>

        <div className="w-full flex-1 space-y-2">
          {distribution.map(({ stars, count }) => {
            const percent =
              total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={stars} className="flex items-center gap-2.5">
                <span className="inline-flex w-8 items-center gap-1 text-xs font-bold text-muted-foreground">
                  {stars}
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                </span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <span
                    className="block h-full rounded-full bg-brand-gradient"
                    style={{ width: `${percent}%` }}
                  />
                </span>
                <span className="w-8 text-right text-xs font-bold tabular-nums text-muted-foreground">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
