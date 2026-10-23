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
import { useAuth, useDebounce } from "@/hooks";
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
  const { user: currentUser } = useAuth();
  const payments = useAppSelector(selectAllPayments);
  const groups = useAppSelector(selectAllGroups);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PaymentStatus | "all">("all");
  const debouncedSearch = useDebounce(search, 250);

  const paymentsStatus = useAppSelector((state) => state.sports.payments.status);
  const groupsStatus = useAppSelector((state) => state.sports.groups.status);

  useEffect(() => {
    if (paymentsStatus === "idle" || paymentsStatus === "failed") {
      dispatch(fetchPaymentsThunk());
    }
    if (groupsStatus === "idle" || groupsStatus === "failed") {
      dispatch(fetchGroupsThunk());
    }
  }, [dispatch, paymentsStatus, groupsStatus]);

  const isClubAdmin = useMemo(() => {
    if (!currentUser) return false;
    if (currentUser.role === "player") return false;
    if (currentUser.role === "member" || currentUser.role === "admin" || currentUser.role === "super_admin" || currentUser.role === "sports_admin") return true;
    const currentUserId = currentUser.id || (currentUser as any)._id;
    const currentUserEmail = currentUser.email?.toLowerCase().trim();

    return groups.some((g) => {
      if (g.createdBy === currentUserId || g.created_by === currentUserId) return true;
      const m = (g.members ?? []).find((member: any) => {
        if (member.userId && member.userId === currentUserId) return true;
        if (member.user_id && member.user_id === currentUserId) return true;
        if (member.id && member.id === currentUserId) return true;
        if (member.email && currentUserEmail && member.email.toLowerCase().trim() === currentUserEmail) return true;
        return false;
      });
      return m && ["Owner", "Admin", "Treasurer"].includes(m.role);
    });
  }, [currentUser, groups]);

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
          isClubAdmin ? (
            <Button asChild variant="accent">
              <Link href={ROUTES.SPORTS_PAYMENTS_CREATE}>
                <Plus />
                Request payment
              </Link>
            </Button>
          ) : undefined
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
              isClubAdmin ? (
                <Button asChild variant="accent">
                  <Link href={ROUTES.SPORTS_PAYMENTS_CREATE}>
                    Request payment
                  </Link>
                </Button>
              ) : undefined
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
