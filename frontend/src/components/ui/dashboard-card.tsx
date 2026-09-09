"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { Card, CardContent } from "@/components/ui/card";

type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

export interface DashboardCardProps {
  title: string;
  value?: React.ReactNode;
  description?: string;
  icon?: IconType;
  iconClassName?: string;
  iconBgClassName?: string;
  href?: string;
  actionIcon?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function DashboardCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
  iconBgClassName,
  href,
  actionIcon,
  footer,
  className,
  children,
}: DashboardCardProps) {
  const card = (
    <Card
      className={cn(
        "group h-full transition-all duration-300 hover:border-primary/30",
        href && "cursor-pointer",
        className,
      )}
    >
      <CardContent className="p-5 flex flex-col justify-between h-full">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            {Icon && (
              <div className={cn("p-3 rounded-xl shrink-0", iconBgClassName)}>
                <Icon className={cn("h-6 w-6", iconClassName)} />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{title}</p>
              {description && (
                <p className="text-xs text-muted-foreground mt-1 truncate">{description}</p>
              )}
            </div>
          </div>
          {actionIcon && <div className="text-muted-foreground">{actionIcon}</div>}
        </div>

        <div className="mt-6 flex-1">
          {value != null && <div className="text-2xl font-black text-foreground">{value}</div>}
          {children}
        </div>
      </CardContent>
      {footer && <div className="border-t border-border/60 p-4">{footer}</div>}
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {card}
      </Link>
    );
  }

  return card;
}
