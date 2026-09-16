"use client";

import { useEffect, useState } from "react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyCard } from "@/components/cards";
import { bookingsService } from "@/services/sports";
import { ROUTES } from "@/constants";
import { formatCurrency } from "@/utils/helpers";
import { formatDate } from "@/utils/date";
import { CreditCard, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OwnerPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    bookingsService.getOwnerBookings()
      .then((res) => {
        const items = res.data?.items || [];
        setPayments(items);
        
        const rev = items
          .filter((b: any) => b.bookingStatus === "CONFIRMED")
          .reduce((sum: number, b: any) => sum + (b.amount || 0), 0);
        setTotalRevenue(rev);
        
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
        title="Payments & Revenue"
        description="Track incoming payments from your venue bookings."
        actions={
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      <div className="mt-8 grid gap-6">
        <section className="rounded-xl border border-border/70 bg-brand-gradient-soft p-6">
          <h2 className="text-sm font-semibold text-muted-foreground">Total Revenue (Confirmed)</h2>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-primary">
            {formatCurrency(totalRevenue)}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold tracking-tight mb-4">Transaction History</h2>
          {loading ? (
            <p>Loading transactions...</p>
          ) : payments.length === 0 ? (
            <EmptyCard
              title="No transactions yet"
              description="Revenue will appear here once bookings are made."
            />
          ) : (
            <div className="rounded-xl border border-border/70 bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground border-b border-border/70">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Transaction ID</th>
                      <th className="px-6 py-4 font-semibold">Date</th>
                      <th className="px-6 py-4 font-semibold">Amount</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/70">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4 font-medium flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          {p.id.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4">{formatDate(p.createdAt)}</td>
                        <td className="px-6 py-4 font-bold">{formatCurrency(p.amount || 0)}</td>
                        <td className="px-6 py-4">
                          <span className={`rounded-md px-2 py-1 text-xs font-bold ${
                            p.bookingStatus === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 
                            p.bookingStatus === 'CANCELLED' ? 'bg-red-100 text-red-800' : 
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {p.bookingStatus === 'CONFIRMED' ? 'PAID' : p.bookingStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </PageContainer>
  );
}
