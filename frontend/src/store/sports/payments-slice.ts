import {
  createSlice,
  nanoid,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { PaymentRequest, PaymentStatus } from "@/types";
// Removed mock import

export interface NewPaymentInput {
  groupId: string;
  title: string;
  amount: number;
  dueDate: string;
  description?: string;
}

export interface PaymentsState {
  payments: PaymentRequest[];
}

const initialState: PaymentsState = { payments: [] };

const paymentsSlice = createSlice({
  name: "sports/payments",
  initialState,
  reducers: {
    paymentAdded: {
      reducer(state, action: PayloadAction<PaymentRequest>) {
        state.payments.unshift(action.payload);
      },
      prepare(input: NewPaymentInput) {
        const now = new Date().toISOString();
        const payment: PaymentRequest = {
          id: nanoid(8),
          createdAt: now,
          updatedAt: now,
          status: "Pending",
          paidCount: 0,
          totalMembers: 0,
          ...input,
        };
        return { payload: payment };
      },
    },
    paymentStatusSet(
      state,
      action: PayloadAction<{ id: string; status: PaymentStatus }>
    ) {
      const payment = state.payments.find((p) => p.id === action.payload.id);
      if (!payment) return;
      payment.status = action.payload.status;
      payment.updatedAt = new Date().toISOString();
    },
  },
});

export const { paymentAdded, paymentStatusSet } = paymentsSlice.actions;
export default paymentsSlice.reducer;
