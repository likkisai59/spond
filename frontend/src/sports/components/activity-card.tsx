import { memo } from "react";
import {
  CalendarDays,
  CreditCard,
  FileText,
  MessageSquare,
  UserPlus,
  Vote,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/shared/card";
import type { ActivityKind } from "@/types";
import { cn } from "@/utils/cn";
import { formatRelative } from "@/utils/date";

const KIND_CONFIG: Record<ActivityKind, { icon: LucideIcon; label: string }> = {
  event: { icon: CalendarDays, label: "Event" },
  payment: { icon: CreditCard, label: "Payment" },
  poll: { icon: Vote, label: "Poll" },
  member: { icon: UserPlus, label: "Member" },
  message: { icon: MessageSquare, label: "Message" },
  file: { icon: FileText, label: "File" },
};

export interface ActivityCardProps {
  activity: {
    id: string;
    kind: ActivityKind;
    title: string;
    description: string;
    actor: string;
    timestamp: string;
  };
  className?: string;
}

export const ActivityCard = memo(function ActivityCard({
  activity,
  className,
}: ActivityCardProps) {
  const config = KIND_CONFIG[activity.kind];
  const Icon = config.icon;

  return (
    <Card
      className={cn(
        "flex items-start gap-3.5 p-4 transition-colors hover:border-accent/40",
        className
      )}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient-soft">
        <Icon className="h-5 w-5 text-accent" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <p className="truncate text-sm font-bold">{activity.title}</p>
          <span className="shrink-0 text-[11px] font-medium text-muted-foreground">
            {formatRelative(activity.timestamp)}
          </span>
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {activity.description}
        </p>
        <p className="mt-1.5 text-[11px] font-semibold text-muted-foreground">
          by {activity.actor} · {config.label}
        </p>
      </div>
    </Card>
  );
});
