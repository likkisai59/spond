"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CreditCard, Plus, Search, SearchX } from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/cards";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchPaymentsThunk } from "@/store/sports/payments-slice";
import { fetchGroupsThunk } from "@/store/sports/groups-slice";
import { selectAllGroups, selectAllPayments } from "@/store/sports/selectors";
import { PaymentCard, StatsCard } from "../components";
import type { PaymentStatus } from "@/types";
import { formatCurrency } from "@/utils/helpers";
import { ROUTES } from "@/constants";

export function PaymentsPage() {
  const dispatch = useAppDispatch();
  const payments = useAppSelector(selectAllPayments);
  const groups = useAppSelector(selectAllGroups);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PaymentStatus | "all">("all");
  const debouncedSearch = useDebounce(search, 250);

  useEffect(() => {
    dispatch(fetchPaymentsThunk());
    if (groups.length === 0) {
      dispatch(fetchGroupsThunk());
    }
  }, [dispatch, groups.length]);

  const groupNames = useMemo(
    () => Object.fromEntries(groups.map((g) => [g.id, g.name])),
    [groups]
  );

  const totals = useMemo(
    () => ({
      collected: payments
        .filter((p) => p.status === "Paid")
        .reduce((sum, p) => sum + p.amount, 0),
      pending: payments
        .filter((p) => p.status === "Pending")
        .reduce((sum, p) => sum + p.amount, 0),
      overdue: payments
        .filter((p) => p.status === "Overdue")
        .reduce((sum, p) => sum + p.amount, 0),
    }),
    [payments]
  );

  const filteredPayments = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    return payments.filter((payment) => {
      const matchesQuery =
        query.length === 0 ||
        payment.title.toLowerCase().includes(query) ||
        (groupNames[payment.groupId] ?? "").toLowerCase().includes(query);
      const matchesStatus = status === "all" || payment.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [payments, debouncedSearch, status, groupNames]);

  return (
    <PageContainer as="main">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "Sports", href: ROUTES.SPORTS },
          { label: "Payments" },
        ]}
        className="mb-4"
      />

      <PageHeader
        title="Payments"
        description="Payment requests, collection progress and outstanding balances."
        actions={
          <Button asChild variant="accent">
            <Link href={ROUTES.SPORTS_PAYMENTS_CREATE}>
              <Plus />
              Request payment
            </Link>
          </Button>
        }
      />

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard
          label="Collected"
          value={formatCurrency(totals.collected)}
          icon={CreditCard}
          className="animate-fade-in-up"
        />
        <StatsCard
          label="Pending"
          value={formatCurrency(totals.pending)}
          icon={CreditCard}
          className="animate-fade-in-up [animation-delay:80ms]"
        />
        <StatsCard
          label="Overdue"
          value={formatCurrency(totals.overdue)}
          icon={CreditCard}
          className="animate-fade-in-up [animation-delay:160ms]"
        />
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search payments…"
            className="pl-9"
            aria-label="Search payments"
          />
        </div>
        <Select
          value={status}
          onValueChange={(value) => setStatus(value as PaymentStatus | "all")}
        >
          <SelectTrigger className="sm:w-48" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6">
        {payments.length === 0 ? (
          <EmptyCard
            icon={CreditCard}
            title="No payment requests"
            description="Create a payment request to start collecting membership or event fees."
            action={
              <Button asChild variant="accent">
                <Link href={ROUTES.SPORTS_PAYMENTS_CREATE}>
                  Request payment
                </Link>
              </Button>
            }
          />
        ) : filteredPayments.length === 0 ? (
          <EmptyCard
            icon={SearchX}
            title="No matching payments"
            description="Try a different search term or status filter."
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredPayments.map((payment) => (
              <PaymentCard
                key={payment.id}
                payment={payment}
                groupName={groupNames[payment.groupId]}
              />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
