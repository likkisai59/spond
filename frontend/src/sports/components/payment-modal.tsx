import { useState } from "react";
import { apiClient } from "@/services/api-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/shared/card";
import { Modal, ModalContent, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { formatCurrency } from "@/utils/helpers";
import { formatDate } from "@/utils/date";
import type { PaymentRequest } from "@/types";
import { useRazorpay } from "@/hooks/use-razorpay";
import { useAppDispatch } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import { paymentStatusSet } from "@/store/sports/payments-slice";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentRequest;
  groupName?: string;
}

export function PaymentModal({ isOpen, onClose, payment, groupName }: PaymentModalProps) {
  const isRazorpayLoaded = useRazorpay();
  const dispatch = useAppDispatch();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayNow = async () => {
    if (!isRazorpayLoaded) {
      dispatch(
        notificationAdded({
          title: "Error",
          message: "Payment system is initializing. Please try again.",
          variant: "error",
        })
      );
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Call Backend to create order
      const { data } = await apiClient.post("/api/v1/payments/create-order", {
        module: "sports",
        module_id: payment.id,
        amount: payment.amount,
        currency: "INR"
      });
      
      const orderData = data?.data || data;
      const orderId = orderData.razorpayOrderId || orderData.razorpay_order_id || orderData.orderId;
      const amount = orderData.amount || payment.amount;
      const currency = orderData.currency || "INR";

      if (!orderId) {
        throw new Error(data?.message || "Failed to create payment order");
      }

      // 2. Initialize Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TUFUGvhtgPCBZb",
        amount: amount * 100, // paise
        currency: currency,
        name: groupName || "Spond",
        description: payment.title,
        order_id: orderId,
        handler: async function (response: any) {
          // 3. Verify Payment
          try {
            await apiClient.post("/api/v1/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              payment_id: payment.id
            });

            // Update Payment Request status in DB
            try {
              await apiClient.put(`/api/v1/sports/payment-requests/${payment.id}/status`, { status: "Paid" });
            } catch (err) {
              console.warn("Could not update payment request status in DB", err);
            }

            dispatch(paymentStatusSet({ id: payment.id, status: "Paid" }));
            dispatch(
              notificationAdded({
                title: "Payment Successful",
                message: "Your payment was processed successfully.",
                variant: "success",
              })
            );
            onClose();
          } catch (error: any) {
            console.error("Payment verification failed", error);
            dispatch(
              notificationAdded({
                title: "Verification Failed",
                message: error.message || "Please contact support.",
                variant: "error",
              })
            );
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: "Santhosh",
          email: "santhosh@gmail.com",
          contact: "9876543210",
        },
        theme: {
          color: "#F97316", // Spond brand accent
        },
      };

      const rzp = new (window as any).Razorpay(options);
      
      rzp.on("payment.failed", function (response: any) {
        setIsProcessing(false);
        dispatch(
          notificationAdded({
            title: "Payment Failed",
            message: response.error?.description || "Payment failed",
            variant: "error",
          })
        );
      });

      rzp.open();
    } catch (error: any) {
      console.error(error);
      setIsProcessing(false);
      dispatch(
        notificationAdded({
          title: "Payment Error",
          message: error.message || "Failed to initiate payment",
          variant: "error",
        })
      );
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Payment request</ModalTitle>
        </ModalHeader>
        <div className="space-y-6 pt-4">
          <div>
            <h3 className="text-xl font-bold">{payment.title}</h3>
            {groupName && <p className="text-sm text-muted-foreground">{groupName}</p>}
          </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-4 bg-muted/50 border-none">
            <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
              Amount
            </p>
            <p className="text-2xl font-extrabold text-primary">
              {formatCurrency(payment.amount)}
            </p>
          </Card>
          
          <Card className="p-4 bg-muted/50 border-none">
            <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
              Due Date
            </p>
            <p className="text-lg font-bold">
              {formatDate(payment.dueDate)}
            </p>
          </Card>
        </div>

        {payment.description && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
              Description
            </p>
            <p className="text-sm leading-relaxed">{payment.description}</p>
          </div>
        )}

        <div className="pt-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button variant="accent" onClick={handlePayNow} disabled={isProcessing || !isRazorpayLoaded}>
            {isProcessing ? "Processing..." : "Pay now"}
          </Button>
        </div>
      </div>
      </ModalContent>
    </Modal>
  );
}
