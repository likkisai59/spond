"use client";

import * as React from "react";
import { Card } from "@/components/shared/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";

export interface ChartContainerProps {
  title: string;
  description?: string;
  isLoading?: boolean;
  height?: number;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function ChartContainer({
  title,
  description,
  isLoading = false,
  height = 300,
  action,
  children,
  className,
}: ChartContainerProps) {
  return (
    <Card className={cn("p-5 sm:p-6", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-0.5">
          <h3 className="text-base font-bold">{title}</h3>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div
        className="mt-5 w-full"
        style={{ minHeight: height }}
        role="img"
        aria-label={title}
      >
        {isLoading ? (
          <Skeleton style={{ height }} className="w-full" />
        ) : (
          children
        )}
      </div>
    </Card>
  );
}
