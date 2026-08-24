"use client";

import type { LucideIcon } from "lucide-react";
import { BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/shared/card";
import { cn } from "@/utils/cn";
import { RatingStars } from "./rating-stars";

export interface ProfileHeaderMetaItem {
  icon: LucideIcon;
  label: string;
}

export interface ProfileHeaderStat {
  label: string;
  value: string | number;
}

export interface ProfileHeaderProps {
  icon: LucideIcon;
  name: string;
  verified?: boolean;
  rating?: number;
  ratingCount?: number;
  meta?: ProfileHeaderMetaItem[];
  badges?: string[];
  stats?: ProfileHeaderStat[];
  actions?: React.ReactNode;
  className?: string;
}

export function ProfileHeader({
  icon: Icon,
  name,
  verified,
  rating,
  ratingCount,
  meta = [],
  badges = [],
  stats = [],
  actions,
  className,
}: ProfileHeaderProps) {
  return (
    <Card className={cn("animate-fade-in-up overflow-hidden", className)}>
      <div className="relative h-28 bg-brand-gradient sm:h-36">
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_120%,rgba(255,255,255,0.35),transparent_50%),radial-gradient(circle_at_85%_-20%,rgba(255,255,255,0.25),transparent_45%)]"
          aria-hidden="true"
        />
      </div>

      <div className="px-6 pb-6 sm:px-8">
        <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end">
            <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border-4 border-card bg-brand-gradient text-white shadow-elevated sm:h-28 sm:w-28">
              <Icon className="h-10 w-10 sm:h-12 sm:w-12" />
            </span>
            <div className="min-w-0 pb-1">
              <h1 className="flex flex-wrap items-center gap-2 text-2xl font-extrabold tracking-tight lg:text-3xl">
                {name}
                {verified ? (
                  <BadgeCheck className="h-5 w-5 text-accent" aria-label="Verified" />
                ) : null}
              </h1>
              {typeof rating === "number" ? (
                <div className="mt-1.5">
                  <RatingStars value={rating} count={ratingCount} />
                </div>
              ) : null}
            </div>
          </div>
          {actions ? <div className="flex shrink-0 gap-2 pb-1">{actions}</div> : null}
        </div>

        {meta.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {meta.map((item) => (
              <span
                key={item.label}
                className="inline-flex items-center gap-1.5"
              >
                <item.icon className="h-4 w-4 text-accent" />
                {item.label}
              </span>
            ))}
          </div>
        ) : null}

        {badges.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {badges.map((badge) => (
              <Badge key={badge} variant="gradient" className="text-[10px]">
                {badge}
              </Badge>
            ))}
          </div>
        ) : null}

        {stats.length > 0 ? (
          <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-muted/40 px-4 py-3 text-center sm:text-left"
              >
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </dt>
                <dd className="mt-0.5 text-lg font-extrabold tracking-tight">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </Card>
  );
}
