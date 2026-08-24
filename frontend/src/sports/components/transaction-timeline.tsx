import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { PaymentTransaction, TransactionStatus } from "@/types";
import { getInitials } from "@/utils/helpers";
import { formatCurrency } from "@/utils/helpers";
import { formatDateTime } from "@/utils/date";
import { cn } from "@/utils/cn";

const STATUS_DOT_CLASSES: Record<TransactionStatus, string> = {
  Success: "bg-emerald-500",
  Pending: "bg-amber-400",
  Failed: "bg-rose-500",
  Refunded: "bg-sky-500",
};

export interface TransactionTimelineProps {
  transactions: PaymentTransaction[];
  className?: string;
}

export function TransactionTimeline({
  transactions,
  className,
}: TransactionTimelineProps) {
  const entries = [...transactions].sort((a, b) =>
    a.paidOn.localeCompare(b.paidOn)
  );

  if (entries.length === 0) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        No transactions recorded yet.
      </p>
    );
  }

  return (
    <ol className={cn("relative space-y-0", className)}>
      {entries.map((txn, index) => {
        const isLast = index === entries.length - 1;
        const isIncoming = txn.status === "Success";
        return (
          <li
            key={txn.id}
            className="relative flex gap-4 pb-5 last:pb-0"
          >
            {!isLast ? (
              <span
                className="absolute left-[15px] top-8 h-[calc(100%-30px)] w-0.5 bg-border"
                aria-hidden="true"
              />
            ) : null}
            <span className="relative z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/70 bg-card">
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  STATUS_DOT_CLASSES[txn.status]
                )}
              />
            </span>
            <div className="min-w-0 flex-1 rounded-xl bg-muted/40 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex min-w-0 items-center gap-2 text-sm font-bold">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px]">
                      {getInitials(txn.memberName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{txn.memberName}</span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-xs font-bold",
                      isIncoming ? "text-emerald-600" : "text-muted-foreground"
                    )}
                  >
                    {isIncoming ? (
                      <ArrowDownLeft className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    )}
                    {formatCurrency(txn.amount)}
                  </span>
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CreditCard className="h-3.5 w-3.5" />
                  {txn.method}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {txn.status} · {formatDateTime(txn.paidOn)} · ref{" "}
                {txn.reference}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
