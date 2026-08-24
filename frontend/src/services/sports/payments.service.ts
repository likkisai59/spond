import { notImplemented } from "@/utils/helpers";
import type {
  ApiResponse,
  Paginated,
  PaginationQuery,
  PaymentRequest,
} from "@/types";

export interface PaymentQuery extends PaginationQuery {
  groupId?: string;
  status?: string;
}

export interface PaymentsService {
  list(query?: PaymentQuery): Promise<ApiResponse<Paginated<PaymentRequest>>>;
  getById(id: string): Promise<ApiResponse<PaymentRequest>>;
  create(input: unknown): Promise<ApiResponse<PaymentRequest>>;
  markPaid(id: string): Promise<ApiResponse<PaymentRequest>>;
}

import { apiClient } from "../api-client";

export const paymentsService: PaymentsService = {
  list: async (query) => {
    return apiClient.get("/v1/payments/history", { params: query });
  },
  getById: async (id) => {
    return apiClient.get(`/v1/payments/${id}`);
  },
  create: async (input) => {
    return apiClient.post("/v1/payments/create-order", input);
  },
  markPaid: async (id) => {
    // Replaced by verify logic, mapping to verify for simplicity or refund
    return apiClient.post(`/v1/payments/verify`, { payment_id: id });
  },
};
