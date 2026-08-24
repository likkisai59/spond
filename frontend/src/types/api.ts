import type { Pagination } from "./common";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiListResponse<T> extends ApiResponse<T[]> {
  pagination?: Pagination;
}

export interface ApiErrorBody {
  statusCode: number;
  message: string;
  error?: string;
  code?: string;
  details?: Record<string, unknown>;
}

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "OPTIONS";
