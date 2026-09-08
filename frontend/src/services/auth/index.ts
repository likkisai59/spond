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
  role?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface RequestOtpPayload {
  email: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface CompleteSignupPayload {
  signup_token: string;
  full_name: string;
  password: string;
  phone?: string;
  accessible_modules: string[];
  role?: string;
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
  requestOtp(payload: RequestOtpPayload): Promise<void>;
  verifyOtp(payload: VerifyOtpPayload): Promise<{ signup_token: string }>;
  completeSignup(payload: CompleteSignupPayload): Promise<AuthSession>;
  logout(payload: LogoutPayload): Promise<void>;
  forgotPassword(payload: ForgotPasswordPayload): Promise<void>;
  resetPassword(payload: ResetPasswordPayload): Promise<void>;
  refreshToken(payload: RefreshTokenPayload): Promise<AuthSession>;
  getCurrentUser(): Promise<User>;
}

export const authService: AuthService = {
  login: async (payload) => {
    const { data } = await apiClient.post<{ status: string; data: any }>("/api/v1/auth/login", payload);
    return {
      user: data.data.user,
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken,
    } as AuthSession;
  },
  register: async (payload) => {
    const { data } = await apiClient.post<{ status: string; data: any }>("/api/v1/auth/register", payload);
    return {
      user: data.data.user,
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken,
    } as AuthSession;
  },
  requestOtp: async (payload) => {
    await apiClient.post("/api/v1/auth/request-otp", payload);
  },
  verifyOtp: async (payload) => {
    const { data } = await apiClient.post<{ status: string; data: { signupToken: string } }>("/api/v1/auth/verify-otp", payload);
    return { signup_token: data.data.signupToken };
  },
  completeSignup: async (payload) => {
    const { data } = await apiClient.post<{ status: string; data: any }>("/api/v1/auth/complete-signup", payload);
    return {
      user: data.data.user,
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken,
    } as AuthSession;
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
    const { data } = await apiClient.post<{ status: string; data: any }>("/api/v1/auth/refresh-token", payload);
    return {
      user: data.data.user,
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken,
    } as AuthSession;
  },
  getCurrentUser: async () => {
    const { data } = await apiClient.get<{ status: string; data: User }>("/api/v1/auth/me");
    return data.data;
  },
};
