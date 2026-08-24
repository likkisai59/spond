"use client";

import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Compass,
  RotateCcw,
  ShieldAlert,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/shared/card";
import { cn } from "@/utils/cn";

export type ErrorStateKind =
  | "generic"
  | "network"
  | "unauthorized"
  | "forbidden"
  | "not-found"
  | "server";

const KIND_CONFIG: Record<
  ErrorStateKind,
  { icon: LucideIcon; title: string; description: string }
> = {
  generic: {
    icon: AlertTriangle,
    title: "Something went wrong",
    description: "An unexpected error occurred. Please try again.",
  },
  network: {
    icon: WifiOff,
    title: "Network error",
    description:
      "We couldn't reach the server. Check your connection and retry.",
  },
  unauthorized: {
    icon: ShieldAlert,
    title: "Session expired",
    description: "Please sign in again to continue.",
  },
  forbidden: {
    icon: ShieldAlert,
    title: "Access restricted",
    description: "You don't have permission to view this content.",
  },
  "not-found": {
    icon: Compass,
    title: "Not found",
    description: "The page or item you're looking for doesn't exist.",
  },
  server: {
    icon: AlertTriangle,
    title: "Server error",
    description: "Our servers hit a snag. We're on it — try again shortly.",
  },
};

export interface ErrorStateProps {
  kind?: ErrorStateKind;
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
  action?: React.ReactNode;
  className?: string;
}

export function ErrorState({
  kind = "generic",
  title,
  description,
  retryLabel = "Try again",
  onRetry,
  action,
  className,
}: ErrorStateProps) {
  const config = KIND_CONFIG[kind];
  const Icon = config.icon;

  return (
    <Card
      className={cn(
        "flex flex-col items-center justify-center border-dashed p-8 text-center sm:p-12",
        className
      )}
      role="alert"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient-soft">
        <Icon className="h-7 w-7 text-accent" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-lg font-bold">{title ?? config.title}</h2>
      <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
        {description ?? config.description}
      </p>
      <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
        {onRetry ? (
          <Button variant="accent" onClick={onRetry}>
            <RotateCcw />
            {retryLabel}
          </Button>
        ) : null}
        {action}
      </div>
    </Card>
  );
}
