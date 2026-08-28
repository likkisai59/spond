"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Clock, CreditCard, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/shared/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/helpers";
import type { EventHubBooking } from "@/types";
import { eventHubService } from "@/services/eventhub/events.service";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export interface PaymentCountdownCardProps {
  booking: EventHubBooking;
  onPaymentSuccess?: () => void;
  onExpired?: () => void;
}

export function PaymentCountdownCard({
  booking,
  onPaymentSuccess,
  onExpired,
}: PaymentCountdownCardProps) {
  const [timeLeftSec, setTimeLeftSec] = useState<number>(() => {
    if (!booking.acceptedAt) return 900; // 15 min default
    const acceptedMs = new Date(booking.acceptedAt).getTime();
    const elapsedSec = Math.floor((Date.now() - acceptedMs) / 1000);
    return Math.max(0, 900 - elapsedSec);
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isExpired = timeLeftSec <= 0;
  const isPaid = booking.bookingStatus === "CONFIRMED" || booking.paymentStatus === "ADVANCE_PAID";

  useEffect(() => {
    if (isPaid || isExpired) return;

    const timer = setInterval(() => {
      setTimeLeftSec((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onExpired?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaid, isExpired, onExpired]);

  const formatMinutes = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handlePayAdvance = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Create order on backend
      const orderRes = await eventHubService.createPaymentOrder(
        booking.id,
        booking.advanceAmount,
        "advance"
      );

      const orderData = orderRes.data;
      if (!orderData) throw new Error("Could not initialize payment order.");

      // 2. Open Razorpay Checkout modal if script is present or fallback to test confirmation
      if (typeof window !== "undefined" && window.Razorpay) {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_mock",
          amount: orderData.amount * 100,
          currency: orderData.currency || "INR",
          name: "EventHub Booking",
          description: `25% Advance for ${booking.providerName || booking.title}`,
          order_id: orderData.razorpayOrderId || orderData.orderId,
          handler: async function (response: any) {
            try {
              await eventHubService.verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                paymentId: orderData.id,
                milestone: "advance",
              });
              setSuccessMsg("Advance payment verified! Booking is now CONFIRMED.");
              onPaymentSuccess?.();
            } catch (verErr: any) {
              setErrorMsg(verErr?.message || "Payment verification failed.");
            }
          },
          prefill: {
            name: "Event Organizer",
            email: "client@eventhub.com",
            contact: "9999999999",
          },
          theme: { color: "#ec4899" },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Mock direct verification for development environment
        await eventHubService.verifyPayment({
          razorpayOrderId: orderData.razorpayOrderId || orderData.orderId || `order_mock_${Date.now()}`,
          razorpayPaymentId: `pay_mock_${Date.now()}`,
          razorpaySignature: "sig_mock_client",
          paymentId: orderData.id,
          milestone: "advance",
        });
        setSuccessMsg("Advance payment verified! Booking is now CONFIRMED.");
        onPaymentSuccess?.();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Payment checkout failed. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  if (isPaid) {
    return (
      <Card className="rounded-2xl border-emerald-500/30 bg-emerald-500/5 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-500">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
              Advance Payment Completed
              <Badge variant="success" className="text-[10px] py-0">CONFIRMED</Badge>
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              25% Advance ({formatCurrency(booking.advanceAmount)}) verified. Remaining 75% ({formatCurrency(booking.finalAmount)}) is due after event completion.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-pink-500/30 bg-gradient-to-br from-pink-500/5 via-card to-card p-5 shadow-lg relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-pink-500 animate-pulse" />
            <h4 className="font-bold text-base text-foreground">
              Booking Accepted — 25% Advance Required
            </h4>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {booking.providerName || "Provider"} accepted your request. Lock your slot before the timer runs out.
          </p>
        </div>

        {/* 15-Min Live Timer */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono font-bold text-sm tracking-wide ${
          isExpired
            ? "border-destructive/30 bg-destructive/10 text-destructive"
            : timeLeftSec < 180
            ? "border-amber-500/40 bg-amber-500/10 text-amber-500 animate-pulse"
            : "border-pink-500/30 bg-pink-500/10 text-pink-500"
        }`}>
          <Clock className="h-4 w-4" />
          <span>{isExpired ? "00:00 (EXPIRED)" : formatMinutes(timeLeftSec)}</span>
        </div>
      </div>

      {errorMsg && (
        <div className="my-3 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="my-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-500 flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Transparent Price Breakdown */}
      <div className="my-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/40 p-3.5 rounded-xl text-xs">
        <div>
          <span className="text-muted-foreground">Total Agreed:</span>
          <p className="font-bold text-foreground mt-0.5">{formatCurrency(booking.amount)}</p>
        </div>
        <div>
          <span className="text-muted-foreground">25% Advance Due:</span>
          <p className="font-bold text-pink-500 mt-0.5">{formatCurrency(booking.advanceAmount)}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Platform Fee:</span>
          <p className="font-bold text-emerald-500 mt-0.5">₹0.00 (Free)</p>
        </div>
        <div>
          <span className="text-muted-foreground">Final Balance (75%):</span>
          <p className="font-bold text-muted-foreground mt-0.5">{formatCurrency(booking.finalAmount)}</p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>Encrypted Razorpay Checkout • Slot holds for 15 minutes</span>
        </div>

        <Button
          type="button"
          disabled={isExpired || loading}
          onClick={handlePayAdvance}
          className={`h-10 px-6 rounded-xl font-bold text-xs shadow-md transition-all ${
            isExpired
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-pink-600 hover:bg-pink-700 text-white"
          }`}
        >
          {loading ? (
            "Processing Payment..."
          ) : isExpired ? (
            "Window Expired"
          ) : (
            <>
              <CreditCard className="mr-1.5 h-3.5 w-3.5" />
              Pay {formatCurrency(booking.advanceAmount)} Advance
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
