import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { PaymentRequest, PaymentStatus } from "@/types";
import { paymentsService } from "@/services/sports/payments.service";

export interface NewPaymentInput {
  groupId: string;
  title: string;
  amount: number;
  dueDate: string;
  description?: string;
}

export interface PaymentsState {
  payments: PaymentRequest[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: PaymentsState = {
  payments: [],
  status: 'idle',
  error: null
};

export const fetchPaymentsThunk = createAsyncThunk(
  "sports/payments/fetchPayments",
  async (groupId?: string) => {
    const response = await paymentsService.list(groupId ? { groupId } : undefined);
    const data = response.data as any;
    return Array.isArray(data) ? data : (data?.items || []);
  }
);

export const createPaymentThunk = createAsyncThunk(
  "sports/payments/createPayment",
  async (input: NewPaymentInput) => {
    const response = await paymentsService.create(input);
    return response.data as PaymentRequest;
  }
);

const paymentsSlice = createSlice({
  name: "sports/payments",
  initialState,
  reducers: {
    paymentStatusSet(
      state,
      action: PayloadAction<{ id: string; status: PaymentStatus }>
    ) {
      const payment = state.payments.find((p) => p.id === action.payload.id);
      if (!payment) return;
      payment.status = action.payload.status;
      if (action.payload.status === "Paid") {
        payment.paidCount = (payment.paidCount || 0) + 1;
      }
      payment.updatedAt = new Date().toISOString();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPaymentsThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPaymentsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.payments = action.payload;
      })
      .addCase(fetchPaymentsThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch payments';
      })
      .addCase(createPaymentThunk.fulfilled, (state, action) => {
        state.payments.unshift(action.payload);
      });
  },
});

export const { paymentStatusSet } = paymentsSlice.actions;
export default paymentsSlice.reducer;

