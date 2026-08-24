"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BellRing,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  ReceiptText,
  Users,
  XCircle,
} from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/cards";
import { Card } from "@/components/shared/card";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import { paymentStatusSet } from "@/store/sports/payments-slice";
import { selectAllGroups, selectPaymentById } from "@/store/sports/selectors";
import { MOCK_TRANSACTIONS } from "../mocks/transactions.mock";
import { StatusBadge } from "../components/status-badge";
import { TransactionTimeline } from "../components/transaction-timeline";
import type { GroupMember, TransactionStatus } from "@/types";
import { formatCurrency, getInitials } from "@/utils/helpers";
import { formatDateTime } from "@/utils/date";
import { ROUTES } from "@/constants";
import { cn } from "@/utils/cn";

const TRANSACTION_BADGES: Record<TransactionStatus, string> = {
  Success: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Failed: "bg-rose-100 text-rose-700",
  Refunded: "bg-sky-100 text-sky-700",
};

export function PaymentDetailsPage() {
  const params = useParams<{ paymentId: string }>();
  const dispatch = useAppDispatch();
  const payment = useAppSelector((state) =>
    selectPaymentById(state, params.paymentId)
  );
  const groups = useAppSelector(selectAllGroups);

  const group = useMemo(
    () => groups.find((g) => g.id === payment?.groupId),
    [groups, payment?.groupId]
  );

  const transactions = useMemo(
    () =>
      MOCK_TRANSACTIONS.filter((txn) => txn.paymentId === payment?.id).sort(
        (a, b) => b.paidOn.localeCompare(a.paidOn)
      ),
    [payment?.id]
  );

  const memberStatus = useMemo(() => {
    const paidNames = new Set(
      transactions
        .filter((txn) => txn.status === "Success")
        .map((txn) => txn.memberName)
    );
    const members: GroupMember[] = group?.members ?? [];
    const paid = members.filter((m) => paidNames.has(m.name));
    const pending = members.filter((m) => !paidNames.has(m.name));
    const today = new Date().toISOString().slice(0, 10);
    const overdue =
      payment && payment.dueDate < today
        ? pending
        : pending.filter(() => false);
    return { paid, pending, overdue };
  }, [transactions, group, payment]);

  if (!payment) {
    return (
      <PageContainer as="main">
        <Breadcrumb
          items={[
            { label: "Home", href: ROUTES.HOME },
            { label: "Sports", href: ROUTES.SPORTS },
            { label: "Payments", href: ROUTES.SPORTS_PAYMENTS },
            { label: "Not found" },
          ]}
          className="mb-6"
        />
        <EmptyCard
          icon={CreditCard}
          title="Payment not found"
          description="This payment request may have been removed or the link is incorrect."
          action={
            <Button asChild variant="accent">
              <Link href={ROUTES.SPORTS_PAYMENTS}>Back to payments</Link>
            </Button>
          }
        />
      </PageContainer>
    );
  }

  const collected = transactions
    .filter((txn) => txn.status === "Success")
    .reduce((sum, txn) => sum + txn.amount, 0);
  const expected = payment.amount * Math.max(payment.totalMembers, 1);
  const progress =
    expected > 0 ? Math.min(100, Math.round((collected / expected) * 100)) : 0;

  const handleMarkPaid = () => {
    dispatch(paymentStatusSet({ id: payment.id, status: "Paid" }));
    dispatch(
      notificationAdded({
        title: "Payment marked as paid",
        message: `"${payment.title}" was marked as paid (demo mode).`,
        variant: "success",
      })
    );
  };

  const handleRemind = () => {
    dispatch(
      notificationAdded({
        title: "Reminder sent",
        message: `Pending members of "${group?.name ?? "the group"}" were reminded about this payment (demo mode).`,
        variant: "info",
      })
    );
  };

  return (
    <PageContainer as="main">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "Sports", href: ROUTES.SPORTS },
          { label: "Payments", href: ROUTES.SPORTS_PAYMENTS },
          { label: payment.title },
        ]}
        className="mb-4"
      />

      <div className="animate-fade-in-up flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={payment.status} />
            {group ? <Badge variant="gradient">{group.name}</Badge> : null}
            <Badge variant="secondary">Per member</Badge>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight lg:text-3xl">
            {payment.title}
          </h1>
          <p className="text-2xl font-extrabold text-accent">
            {formatCurrency(payment.amount)}
            <span className="text-sm font-semibold text-muted-foreground">
              {" "}
              / member
            </span>
          </p>
        </div>
        <Button asChild variant="ghost" className="shrink-0">
          <Link href={ROUTES.SPORTS_PAYMENTS}>
            <ArrowLeft />
            Back to payments
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="animate-fade-in-up p-6 sm:p-7">
            <h2 className="text-lg font-extrabold tracking-tight">Details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <InfoRow
                icon={CalendarDays}
                label="Due date"
                value={formatDateTime(payment.dueDate, "MMM d, yyyy")}
                hint={
                  payment.status === "Overdue" ? "Overdue" : undefined
                }
              />
              <InfoRow
                icon={Users}
                label="Members paid"
                value={`${payment.paidCount} of ${payment.totalMembers}`}
              />
              <InfoRow
                icon={Clock3}
                label="Created"
                value={formatDateTime(payment.createdAt)}
              />
              <InfoRow
                icon={ReceiptText}
                label="Reference"
                value={payment.id.toUpperCase()}
              />
            </div>
            {payment.description ? (
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                {payment.description}
              </p>
            ) : null}
          </Card>

          <Card className="animate-fade-in-up p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold tracking-tight">
                Transaction history
              </h2>
              <Badge variant="secondary">{transactions.length} records</Badge>
            </div>
            {transactions.length > 0 ? (
              <>
                <div className="mt-4 hidden grid-cols-[1.4fr,0.8fr,0.9fr,1fr,1.1fr] gap-3 border-b border-border/70 pb-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground md:grid">
                  <span>Member</span>
                  <span>Amount</span>
                  <span>Method</span>
                  <span>Status</span>
                  <span>Paid on</span>
                </div>
                <ul className="divide-y divide-border/70">
                  {transactions.map((txn) => (
                    <li
                      key={txn.id}
                      className="grid gap-2 py-3.5 md:grid-cols-[1.4fr,0.8fr,0.9fr,1fr,1.1fr] md:items-center md:gap-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-gradient-soft text-[11px] font-extrabold text-accent">
                          {getInitials(txn.memberName)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">
                            {txn.memberName}
                          </p>
                          <p className="text-[11px] text-muted-foreground md:hidden">
                            {txn.reference}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-extrabold tabular-nums">
                        {formatCurrency(txn.amount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {txn.method}
                      </p>
                      <span
                        className={cn(
                          "w-fit rounded-full px-2.5 py-1 text-[11px] font-bold",
                          TRANSACTION_BADGES[txn.status]
                        )}
                      >
                        {txn.status}
                      </span>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {formatDateTime(txn.paidOn)}
                        </p>
                        <p className="hidden text-[11px] text-muted-foreground md:block">
                          {txn.reference}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                No transactions recorded for this request yet.
              </p>
            )}
          </Card>

          <Card className="animate-fade-in-up p-6 sm:p-7">
            <h2 className="text-lg font-extrabold tracking-tight">
              Transaction timeline
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Payments received for this request, oldest first.
            </p>
            <TransactionTimeline transactions={transactions} className="mt-5" />
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="animate-fade-in-up p-6">
            <h2 className="text-lg font-extrabold tracking-tight">
              Collection progress
            </h2>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-primary">
              {formatCurrency(collected)}
            </p>
            <p className="text-xs font-semibold text-muted-foreground">
              of {formatCurrency(expected)} expected
            </p>
            <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-muted">
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
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Paid
                </span>
                <span className="font-bold">{payment.paidCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Clock3 className="h-4 w-4 text-amber-500" />
                  Pending
                </span>
                <span className="font-bold">
                  {Math.max(0, payment.totalMembers - payment.paidCount)}
                </span>
              </div>
            </div>
          </Card>

          <Card className="animate-fade-in-up p-6">
            <h2 className="text-lg font-extrabold tracking-tight">
              Member status
            </h2>
            <div className="mt-4 space-y-5">
              <MemberStatusList
                title="Paid"
                tone="bg-emerald-100 text-emerald-700"
                members={memberStatus.paid}
              />
              <MemberStatusList
                title="Pending"
                tone="bg-amber-100 text-amber-700"
                members={memberStatus.pending}
              />
              <MemberStatusList
                title="Overdue"
                tone="bg-rose-100 text-rose-700"
                members={memberStatus.overdue}
              />
            </div>
          </Card>

          <Card className="animate-fade-in-up p-6">
            <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
              <FileText className="h-4 w-4 text-accent" />
              Actions
            </h2>
            <div className="mt-4 space-y-2.5">
              {payment.status !== "Paid" ? (
                <>
                  <Button
                    variant="accent"
                    className="w-full rounded-full"
                    onClick={handleMarkPaid}
                  >
                    <CheckCircle2 />
                    Mark as paid
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full rounded-full"
                    onClick={handleRemind}
                  >
                    <BellRing />
                    Send reminder
                  </Button>
                </>
              ) : (
                <p className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Fully collected — nice work!
                </p>
              )}
              {payment.status === "Overdue" ? (
                <p className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1.5 text-xs font-bold text-rose-700">
                  <XCircle className="h-3.5 w-3.5" />
                  This request is overdue
                </p>
              ) : null}
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3">
      <Icon className="h-5 w-5 shrink-0 text-accent" />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm font-bold">{value}</p>
        {hint ? (
          <p className="text-[11px] font-bold text-destructive">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}

function MemberStatusList({
  title,
  tone,
  members,
}: {
  title: string;
  tone: string;
  members: GroupMember[];
}) {
  return (
    <div>
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <span className={cn("rounded-full px-2 py-0.5 text-[11px]", tone)}>
          {title}
        </span>
        {members.length}
      </p>
      {members.length > 0 ? (
        <ul className="mt-2.5 space-y-2">
          {members.slice(0, 6).map((member) => (
            <li key={member.id} className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-gradient-soft text-[10px] font-extrabold text-accent">
                {getInitials(member.name)}
              </span>
              <span className="truncate text-sm font-semibold">
                {member.name}
              </span>
            </li>
          ))}
          {members.length > 6 ? (
            <li className="text-xs font-semibold text-muted-foreground">
              +{members.length - 6} more
            </li>
          ) : null}
        </ul>
      ) : (
        <p className="mt-1.5 text-xs text-muted-foreground">None</p>
      )}
    </div>
  );
}
