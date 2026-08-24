"use client";

import * as React from "react";
import { Card } from "@/components/shared/card";
import { EmptyCard } from "@/components/cards";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";

export interface DataTableColumn<T> {
  key: string;
  header: React.ReactNode;
  className?: string;
  render?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey?: (row: T, index: number) => string;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  isLoading = false,
  emptyTitle = "Nothing here yet",
  emptyDescription = "Records will appear in this table once available.",
  emptyAction,
  className,
}: DataTableProps<T>) {
  const skeletonRows = React.useMemo(() => Array.from({ length: 5 }), []);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="w-full overflow-x-auto">
        <table className="w-full caption-bottom text-sm">
          <thead>
            <tr className="border-b bg-muted/60">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    "h-11 px-4 text-left align-middle text-xs font-bold uppercase tracking-wider text-muted-foreground",
                    column.className
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              skeletonRows.map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`} className="border-b last:border-0">
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3.5">
                      <Skeleton className="h-4 w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <EmptyCard
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                    className="border-none shadow-none"
                  />
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => {
                const key = rowKey ? rowKey(row, rowIndex) : `row-${rowIndex}`;
                return (
                  <tr
                    key={key}
                    className="border-b transition-colors last:border-0 hover:bg-muted/40"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn("px-4 py-3.5 align-middle", column.className)}
                      >
                        {column.render
                          ? column.render(row)
                          : ((row as Record<string, unknown>)[column.key] as
                              | React.ReactNode
                              | undefined) ?? "—"}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
