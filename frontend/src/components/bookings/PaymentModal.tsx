"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, CheckCircle2, Loader2, IndianRupee } from "lucide-react";
import { bandService } from "@/services/band";
import toast from "react-hot-toast";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  amount: number;
  paymentType: "ADVANCE_PAID" | "FULLY_PAID";
  onSuccess: () => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  bookingId,
  amount,
  paymentType,
  onSuccess,
}: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePay = async () => {
    setIsProcessing(true);
    
    // Simulate dynamic payment gateway delay
    setTimeout(async () => {
      try {
        await bandService.simulatePayment(bookingId, paymentType);
        setIsProcessing(false);
        setIsSuccess(true);
        toast.success("Payment processed successfully!");
        
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
          onSuccess();
        }, 1500);
      } catch (err) {
        setIsProcessing(false);
        const error = err as { response?: { data?: { error?: { message?: string } } } };
        toast.error(error.response?.data?.error?.message || "Payment failed to process");
      }
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(_open) => !_open && !isProcessing && !isSuccess && onClose()}>
      <DialogContent className="bg-card border border-border sm:max-w-md text-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-center mb-1">Secure Checkout</DialogTitle>
          <DialogDescription className="text-center text-xs">
            Complete your {paymentType === "ADVANCE_PAID" ? "advance booking" : "final"} payment via secure gateway.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {!isProcessing && !isSuccess && (
            <div className="space-y-6 animate-in fade-in zoom-in-95">
              <div className="bg-accent/40 rounded-xl p-4 border border-border flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">
                    Total Due
                  </p>
                  <p className="text-3xl font-black text-foreground flex items-center">
                    <IndianRupee className="h-6 w-6 mr-1" />
                    {amount.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="bg-primary/10 text-primary p-3 rounded-full">
                  <CreditCard className="h-8 w-8" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-background rounded-lg border border-border p-3 text-xs flex justify-between">
                  <span className="text-muted-foreground">Gateway Fee</span>
                  <span className="font-semibold flex items-center">
                    <IndianRupee className="h-3 w-3" />0
                  </span>
                </div>
                <div className="bg-background rounded-lg border border-border p-3 text-xs flex justify-between">
                  <span className="text-muted-foreground">Taxes</span>
                  <span className="font-semibold flex items-center text-emerald-500">
                    Included
                  </span>
                </div>
              </div>

              <Button
                onClick={handlePay}
                className="w-full h-12 text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-transform active:scale-95"
              >
                Pay <IndianRupee className="h-3.5 w-3.5 ml-1 mr-0.5" />{amount.toLocaleString("en-IN")} Now
              </Button>
            </div>
          )}

          {isProcessing && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-in fade-in">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                <Loader2 className="h-12 w-12 text-primary animate-spin relative z-10" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Processing Payment...</h3>
              <p className="text-xs text-muted-foreground text-center max-w-[250px]">
                Please do not close this window or click back while we securely process your transaction.
              </p>
            </div>
          )}

          {isSuccess && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-in zoom-in">
              <div className="bg-emerald-500/20 text-emerald-500 rounded-full p-4 mb-2">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <h3 className="text-2xl font-black text-foreground">Payment Successful!</h3>
              <p className="text-xs text-muted-foreground">Your transaction has been securely verified.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
