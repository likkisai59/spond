"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/shared/card";
import type { BandReview } from "@/types";
import { getInitials } from "@/utils/helpers";
import { formatDate } from "@/utils/date";
import { cn } from "@/utils/cn";
import { RatingStars } from "./rating-stars";

export interface ReviewCardProps {
  review: BandReview;
  className?: string;
}

export function ReviewCard({ review, className }: ReviewCardProps) {
  return (
    <Card
      interactive
      className={cn("flex h-full flex-col p-5 sm:p-6 animate-fade-in-up", className)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{getInitials(review.author)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold">{review.author}</p>
            <p className="truncate text-xs text-muted-foreground">
              {review.authorRole}
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="shrink-0 text-[10px]">
          {review.subjectType}
        </Badge>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <RatingStars value={review.rating} />
        <span className="text-xs text-muted-foreground">
          {formatDate(review.createdAt)}
        </span>
      </div>

      <h3 className="mt-3 text-base font-extrabold tracking-tight">
        {review.title}
      </h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
        {review.content}
      </p>

      <p className="mt-4 border-t border-border/70 pt-3 text-xs font-semibold text-muted-foreground">
        about{" "}
        <span className="font-extrabold text-accent">{review.subjectName}</span>
        {" · "}
        event on {formatDate(review.eventDate)}
      </p>
    </Card>
  );
}
