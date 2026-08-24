"use client";

import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Info,
  Trash2,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/shared/card";
import { formatRelative } from "@/utils/date";
import type { AppNotification, NotificationVariant } from "@/types";
import { cn } from "@/utils/cn";

const VARIANT_ICONS: Record<NotificationVariant, LucideIcon> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
};

export interface NotificationCardProps {
  notification: AppNotification;
  onMarkRead?: (id: string) => void;
  onRemove?: (id: string) => void;
  className?: string;
}

export function NotificationCard({
  notification,
  onMarkRead,
  onRemove,
  className,
}: NotificationCardProps) {
  const Icon = VARIANT_ICONS[notification.variant];

  return (
    <Card
      className={cn(
        "flex items-start gap-3.5 p-4 transition-colors hover:border-accent/40",
        !notification.read && "border-accent/30",
        className
      )}
    >
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient-soft">
        <Icon className="h-5 w-5 text-accent" />
        {!notification.read ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-accent ring-2 ring-card" />
        ) : null}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <p className="truncate text-sm font-bold">{notification.title}</p>
          <span className="shrink-0 text-[11px] font-medium text-muted-foreground">
            {formatRelative(notification.createdAt)}
          </span>
        </div>
        {notification.message ? (
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {notification.message}
          </p>
        ) : null}
        {!notification.read ? (
          <Badge variant="accent" className="mt-2 px-2 py-0 text-[10px]">
            New
          </Badge>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {!notification.read && onMarkRead ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => onMarkRead(notification.id)}
            aria-label={`Mark "${notification.title}" as read`}
          >
            <Check />
          </Button>
        ) : null}
        {onRemove ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(notification.id)}
            aria-label={`Remove "${notification.title}"`}
          >
            <Trash2 />
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
