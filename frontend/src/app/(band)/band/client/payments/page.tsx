"use client";

import React, { useState } from "react";
import {
  IndianRupee,
  CreditCard,
  CheckCircle2,
  Clock,
  Download,
  ShieldCheck,
  Building2,
  Music,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { bandService } from "@/services/band";
import { useEffect } from "react";
import { Booking } from "@/types/band";

interface Transaction {
  id: string;
  bookingId: string;
  eventName: string;
  providerName: string;
  providerType: "artist" | "venue";
  milestone: "25% Advance" | "75% Final" | "100% Full Payment";
  amount: number;
  date: string;
  dueDate?: string;
  status: "completed" | "pending" | "processing" | "refunded";
  paymentMethod?: string;
}

const INITIAL_TRANSACTIONS: Transaction[] = [];

export default function ClientPaymentsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all");
  const [payingId, setPayingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const bookings = await bandService.getMyBookings("customer");
        const txns: Transaction[] = [];
        bookings.forEach((b: Booking) => {
          const totalAmt = b.total_amount || 0;
          const advAmt = b.advance_amount || totalAmt * 0.25;
          const finalAmt = totalAmt - advAmt;

          const providerType: "artist" | "venue" = b.provider_type === "venue" ? "venue" : "artist";
          const providerName = providerType === "venue" ? "Venue Booking" : "Artist Booking";

          // Determine payment states from PaymentStatus enum
          const advancePaid = ["ADVANCE_PAID", "FINAL_PENDING", "FULLY_PAID"].includes(b.payment_status);
          const fullyPaid = b.payment_status === "FULLY_PAID";
          
          // Advance Milestone
          txns.push({
            id: `TXN-${b.id}-1`,
            bookingId: b.id,
            eventName: b.message || "Booking Event",
            providerName: providerName,
            providerType: providerType,
            milestone: "25% Advance",
            amount: advAmt,
            date: b.created_at?.split("T")[0] || "-",
            status: advancePaid ? "completed" : "pending",
          });

          // Final Milestone
          txns.push({
            id: `TXN-${b.id}-2`,
            bookingId: b.id,
            eventName: b.message || "Booking Event",
            providerName: providerName,
            providerType: providerType,
            milestone: "75% Final",
            amount: finalAmt,
            date: fullyPaid ? (b.updated_at?.split("T")[0] || "-") : "-",
            dueDate: b.event_date ? b.event_date.split("T")[0] : "-",
            status: fullyPaid ? "completed" : "pending",
          });
        });
        setTransactions(txns);
      } catch (error) {
        console.error("Failed to load transactions", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const totalPaid = transactions
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingAmount = transactions
    .filter((t) => t.status === "pending")
    .reduce((sum, t) => sum + t.amount, 0);

  const handlePayMilestone = (txId: string) => {
    setPayingId(txId);
    setTimeout(() => {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === txId
            ? {
                ...t,
                status: "completed",
                date: new Date().toISOString().split("T")[0],
                paymentMethod: "Razorpay Secure (UPI/Card)",
              }
            : t
        )
      );
      setPayingId(null);
      toast.success("Milestone payment processed successfully!");
    }, 1200);
  };

  const handleDownloadInvoice = (txn: Transaction) => {
    toast.success(`Downloading invoice receipt for ${txn.id}...`);
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filter === "completed") return t.status === "completed";
    if (filter === "pending") return t.status === "pending";
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {isLoading && (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
      {!isLoading && (
        <>
          {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <IndianRupee className="h-7 w-7 text-primary" />
          Payments & Billing
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review your milestone transactions, invoices, and settle final provider payments securely.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-border/80">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-medium">Total Paid (Completed)</CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground">
              ₹{totalPaid.toLocaleString("en-IN")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>
                {transactions.filter((t) => t.status === "completed").length} payments completed
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-medium">Upcoming Milestone Due</CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-500">
              ₹{pendingAmount.toLocaleString("en-IN")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1.5 text-xs text-amber-500 font-medium">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {transactions.filter((t) => t.status === "pending").length} payment pending release
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-medium text-primary">Payment Security</CardDescription>
            <CardTitle className="text-lg font-bold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              EventHub Escrow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              25% advance confirms booking; 75% final milestone is protected until event performance.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Milestone Schedule Notice */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            Standard 2-Step Milestone Payments (25% / 75%)
          </h4>
          <p className="text-xs text-muted-foreground">
            Advance (25%) is paid upon provider booking confirmation to reserve the slot. The remaining balance (75%)
            is due on or before the event date.
          </p>
        </div>
      </div>

      {/* Filter and Transactions Table */}
      <Card className="border border-border/80">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-4">
          <div>
            <CardTitle className="text-base font-bold text-foreground">Transaction History</CardTitle>
            <CardDescription className="text-xs">All past and pending milestone receipts</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
              className="h-8 text-xs rounded-lg"
            >
              All
            </Button>
            <Button
              variant={filter === "completed" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("completed")}
              className="h-8 text-xs rounded-lg"
            >
              Completed
            </Button>
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("pending")}
              className="h-8 text-xs rounded-lg"
            >
              Pending Due
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-b border-border/70 text-muted-foreground text-[11px] uppercase tracking-wider text-left">
                <tr>
                  <th className="p-3.5 pl-6 font-semibold">Ref / Date</th>
                  <th className="p-3.5 font-semibold">Event & Booking</th>
                  <th className="p-3.5 font-semibold">Provider</th>
                  <th className="p-3.5 font-semibold">Milestone</th>
                  <th className="p-3.5 font-semibold">Amount</th>
                  <th className="p-3.5 font-semibold">Status</th>
                  <th className="p-3.5 pr-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5 pl-6">
                      <div className="font-mono font-bold text-foreground">{tx.id}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {tx.date !== "-" ? tx.date : `Due: ${tx.dueDate}`}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-semibold text-foreground">{tx.eventName}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{tx.bookingId}</div>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        {tx.providerType === "artist" ? (
                          <Music className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <Building2 className="h-3.5 w-3.5 text-primary" />
                        )}
                        <span>{tx.providerName}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground capitalize">{tx.providerType}</div>
                    </td>

                    <td className="p-3.5">
                      <Badge variant="outline" className="font-medium text-[11px] py-0.5">
                        {tx.milestone}
                      </Badge>
                    </td>

                    <td className="p-3.5">
                      <div className="font-bold text-foreground text-sm">
                        ₹{tx.amount.toLocaleString("en-IN")}
                      </div>
                      {tx.paymentMethod && (
                        <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                          {tx.paymentMethod}
                        </div>
                      )}
                    </td>

                    <td className="p-3.5">
                      {tx.status === "completed" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" />
                          Paid
                        </span>
                      )}
                      {tx.status === "pending" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          <Clock className="h-3 w-3" />
                          Due
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 pr-6 text-right">
                      {tx.status === "pending" ? (
                        <Button
                          size="sm"
                          disabled={payingId === tx.id}
                          onClick={() => handlePayMilestone(tx.id)}
                          className="h-8 text-xs rounded-lg px-3 bg-primary text-primary-foreground font-semibold"
                        >
                          {payingId === tx.id ? "Processing..." : "Pay Now"}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownloadInvoice(tx)}
                          className="h-8 text-xs rounded-lg px-2 text-muted-foreground hover:text-foreground gap-1"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Receipt
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      </>
      )}
    </div>
  );
}
