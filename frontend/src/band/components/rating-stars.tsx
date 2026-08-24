"use client";

import { Star } from "lucide-react";
import { cn } from "@/utils/cn";

export interface RatingStarsProps {
  value: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
} as const;

export function RatingStars({
  value,
  count,
  size = "sm",
  className,
}: RatingStarsProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        className
      )}
      aria-label={`Rated ${value} out of 5`}
    >
      <span className="inline-flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              SIZE_CLASSES[size],
              star <= Math.round(value)
                ? "fill-amber-400 text-amber-400"
                : "fill-muted text-muted"
            )}
          />
        ))}
      </span>
      <span className="text-xs font-bold tabular-nums">
        {value.toFixed(1)}
      </span>
      {typeof count === "number" ? (
        <span className="text-xs font-medium text-muted-foreground">
          ({count})
        </span>
      ) : null}
    </span>
  );
}

export interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export function StarRatingInput({
  value,
  onChange,
  className,
}: StarRatingInputProps) {
  return (
    <div className={cn("flex items-center gap-1", className)} role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          onClick={() => onChange(star)}
          className="rounded-md p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Star
            className={cn(
              "h-6 w-6 transition-colors",
              star <= value
                ? "fill-amber-400 text-amber-400"
                : "fill-muted text-muted-foreground"
            )}
          />
        </button>
      ))}
    </div>
  );
}
