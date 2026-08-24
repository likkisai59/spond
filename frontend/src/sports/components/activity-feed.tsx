import { memo } from "react";
import type { ActivityItem } from "@/types";
import { ActivityCard } from "./activity-card";
import { cn } from "@/utils/cn";

export interface ActivityFeedProps {
  activities: ActivityItem[];
  max?: number;
  title?: string;
  className?: string;
}

export const ActivityFeed = memo(function ActivityFeed({
  activities,
  max = 6,
  title = "Recent activity",
  className,
}: ActivityFeedProps) {
  const items = activities.slice(0, max);

  return (
    <section className={cn("space-y-4", className)}>
      <h2 className="text-lg font-extrabold tracking-tight">{title}</h2>
      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Nothing yet — new activity will show up here.
        </p>
      )}
    </section>
  );
});
