import { apiClient } from "@/services/api-client";
import type { AuthSession, User } from "@/types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  accessible_modules: string[];
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  new_password: string;
}

export interface RefreshTokenPayload {
  refresh_token: string;
}

export interface LogoutPayload {
  refresh_token: string;
}

export interface AuthService {
  login(payload: LoginPayload): Promise<AuthSession>;
  register(payload: RegisterPayload): Promise<AuthSession>;
  logout(payload: LogoutPayload): Promise<void>;
  forgotPassword(payload: ForgotPasswordPayload): Promise<void>;
  resetPassword(payload: ResetPasswordPayload): Promise<void>;
  refreshToken(payload: RefreshTokenPayload): Promise<AuthSession>;
  getCurrentUser(): Promise<User>;
}

export const authService: AuthService = {
  login: async (payload) => {
    const { data } = await apiClient.post<{ status: string; data: AuthSession }>("/api/v1/auth/login", payload);
    return data.data;
  },
  register: async (payload) => {
    const { data } = await apiClient.post<{ status: string; data: AuthSession }>("/api/v1/auth/register", payload);
    return data.data;
  },
  logout: async (payload) => {
    await apiClient.post("/api/v1/auth/logout", payload);
  },
  forgotPassword: async (payload) => {
    await apiClient.post("/api/v1/auth/forgot-password", payload);
  },
  resetPassword: async (payload) => {
    await apiClient.post("/api/v1/auth/reset-password", payload);
  },
  refreshToken: async (payload) => {
    const { data } = await apiClient.post<{ status: string; data: AuthSession }>("/api/v1/auth/refresh-token", payload);
    return data.data;
  },
  getCurrentUser: async () => {
    const { data } = await apiClient.get<{ status: string; data: User }>("/api/v1/auth/me");
    return data.data;
  },
};
