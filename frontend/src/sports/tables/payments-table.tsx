"use client";

import { DataTable, type DataTableColumn } from "@/components/tables";
import { StatusBadge } from "../components/status-badge";
import { formatCurrency } from "@/utils/helpers";
import { formatDate } from "@/utils/date";
import type { PaymentRequest } from "@/types";

export interface PaymentsTableProps {
  payments: PaymentRequest[];
  groupNameById?: Record<string, string>;
}

export function PaymentsTable({ payments, groupNameById }: PaymentsTableProps) {
  const columns: DataTableColumn<PaymentRequest>[] = [
    {
      key: "title",
      header: "Payment",
      render: (payment) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{payment.title}</p>
          {groupNameById?.[payment.groupId] ? (
            <p className="truncate text-xs text-muted-foreground">
              {groupNameById[payment.groupId]}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (payment) => (
        <span className="text-sm font-extrabold text-primary">
          {formatCurrency(payment.amount)}
        </span>
      ),
    },
    {
      key: "dueDate",
      header: "Due date",
      render: (payment) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(payment.dueDate)}
        </span>
      ),
    },
    {
      key: "progress",
      header: "Collected",
      render: (payment) => (
        <div className="min-w-[120px]">
          <p className="text-xs font-semibold text-muted-foreground">
            {payment.paidCount}/{payment.totalMembers || "—"} paid
          </p>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full rounded-full bg-brand-gradient"
              style={{
                width: `${
                  payment.totalMembers > 0
                    ? (payment.paidCount / payment.totalMembers) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (payment) => <StatusBadge status={payment.status} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={payments}
      rowKey={(payment) => payment.id}
      emptyTitle="No payment requests"
      emptyDescription="Create a payment request to start collecting from members."
    />
  );
}
