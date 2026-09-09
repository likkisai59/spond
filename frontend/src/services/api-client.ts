import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { API_BASE_URL, API_TIMEOUT_MS, STORAGE_KEYS } from "@/utils/constants";
import { storage } from "@/utils/storage";
export interface ApiErrorBody {
  statusCode: number;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}
export class ApiRequestError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: Record<string, unknown>;

  constructor(body: ApiErrorBody) {
    super(body.message);
    this.name = "ApiRequestError";
    this.status = body.statusCode;
    this.code = body.code;
    this.details = body.details;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isValidationError(): boolean {
    return this.status === 400 || this.status === 422;
  }
}

function toApiRequestError(error: AxiosError<ApiErrorBody>): ApiRequestError {
  const status = error.response?.status ?? 0;
  const body = error.response?.data;

  return new ApiRequestError({
    statusCode: status,
    message: body?.message ?? error.message ?? "An unexpected error occurred.",
    code: body?.code,
    details: body?.details,
  });
}

/** Recursively convert all snake_case keys → camelCase (pure TS, zero deps). */
function deepCamel(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(deepCamel);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase()),
        deepCamel(v),
      ])
    );
  }
  return value;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError<ApiErrorBody>) =>
    Promise.reject(toApiRequestError(error))
);

apiClient.interceptors.response.use(
  (response) => {
    // Auto-convert snake_case keys → camelCase for all successful responses
    if (response.data && typeof response.data === "object") {
      response.data = deepCamel(response.data);
    }
    return response;
  },
  (error: AxiosError<ApiErrorBody>) => {
    const apiError = toApiRequestError(error);

    if (apiError.isUnauthorized) {
      storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
      storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
    }

    return Promise.reject(apiError);
  }
);

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  if (axios.isAxiosError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}
