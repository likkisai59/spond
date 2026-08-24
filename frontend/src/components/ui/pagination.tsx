"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/utils/cn";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  className?: string;
}

function getPageRange(
  page: number,
  totalPages: number,
  siblingCount: number
): (number | "ellipsis")[] {
  const totalNumbers = siblingCount * 2 + 5;
  if (totalPages <= totalNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(page - siblingCount, 1);
  const rightSibling = Math.min(page + siblingCount, totalPages);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftCount = siblingCount * 2 + 2;
    return [
      ...Array.from({ length: leftCount }, (_, i) => i + 1),
      "ellipsis" as const,
      totalPages,
    ];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightCount = siblingCount * 2 + 2;
    return [
      1,
      "ellipsis" as const,
      ...Array.from(
        { length: rightCount },
        (_, i) => totalPages - rightCount + i + 1
      ),
    ];
  }

  return [
    1,
    "ellipsis" as const,
    ...Array.from(
      { length: siblingCount * 2 + 1 },
      (_, i) => leftSibling + i
    ),
    "ellipsis" as const,
    totalPages,
  ];
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
}: PaginationProps) {
  if (totalPages <= 0) return null;
  const pages = getPageRange(page, totalPages, siblingCount);

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1", className)}
    >
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-full"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft />
      </Button>

      {pages.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="flex h-9 w-9 items-center justify-center text-muted-foreground"
          >
            <MoreHorizontal className="h-4 w-4" />
          </span>
        ) : (
          <Button
            key={item}
            variant={item === page ? "accent" : "ghost"}
            size="icon"
            className="h-9 w-9 rounded-full"
            aria-current={item === page ? "page" : undefined}
            onClick={() => onPageChange(item)}
          >
            {item}
          </Button>
        )
      )}

      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-full"
        aria-label="Next page"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight />
      </Button>
    </nav>
  );
}
