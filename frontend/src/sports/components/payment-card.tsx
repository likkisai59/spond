import { CalendarDays, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/shared/card";
import { StatusBadge } from "./status-badge";
import { formatCurrency } from "@/utils/helpers";
import { formatDate } from "@/utils/date";
import type { PaymentRequest } from "@/types";
import { cn } from "@/utils/cn";

export interface PaymentCardProps {
  payment: PaymentRequest;
  groupName?: string;
  className?: string;
}

export function PaymentCard({ payment, groupName, className }: PaymentCardProps) {
  const progress =
    payment.totalMembers > 0
      ? Math.round((payment.paidCount / payment.totalMembers) * 100)
      : 0;

  return (
    <Card
      interactive
      className={cn("flex h-full flex-col p-5 sm:p-6 animate-fade-in-up", className)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {groupName ? (
            <p className="text-xs font-bold uppercase tracking-wider text-accent">
              {groupName}
            </p>
          ) : null}
          <h3 className="mt-1 truncate text-lg font-extrabold tracking-tight">
            {payment.title}
          </h3>
        </div>
        <StatusBadge status={payment.status} />
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="text-3xl font-extrabold tracking-tight text-primary">
          {formatCurrency(payment.amount)}
        </p>
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <CalendarDays className="h-4 w-4 text-accent" />
          Due {formatDate(payment.dueDate)}
        </p>
      </div>

      {payment.description ? (
        <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {payment.description}
        </p>
      ) : (
        <div className="flex-1" />
      )}

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
            {payment.paidCount}/{payment.totalMembers || "—"} paid
          </span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
          <span
            className={cn(
              "block h-full rounded-full transition-all",
              payment.status === "Overdue"
                ? "bg-destructive"
                : "bg-brand-gradient"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </Card>
  );
}
