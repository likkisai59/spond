import { apiClient } from "../api-client";
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

export const paymentsService: PaymentsService = {
  list: async (query) => {
    const { data } = await apiClient.get("/api/v1/sports/payment-requests", { params: query });
    return data;
  },
  getById: async (id) => {
    const { data } = await apiClient.get(`/api/v1/sports/payment-requests/${id}`);
    return data;
  },
  create: async (input) => {
    const { data } = await apiClient.post("/api/v1/sports/payment-requests", input);
    return data;
  },
  markPaid: async (id) => {
    const { data } = await apiClient.put(`/api/v1/sports/payment-requests/${id}/status`, { status: "Paid" });
    return data;
  },
};

